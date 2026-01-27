using System.Text;
using CoopMonitor.API.Data;
using CoopMonitor.API.Jobs;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using CoopMonitor.API.Services.Alerting;
using CoopMonitor.API.Services.Notifications;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Quartz;
using Scalar.AspNetCore;
using Serilog;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Setup Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// 2. Add services to the container
builder.Services.AddControllers();

// OpenAPI Config
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        var securityScheme = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme."
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes.Add("Bearer", securityScheme);

        var securityRequirement = new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        };

        document.SecurityRequirements.Add(securityRequirement);
        return Task.CompletedTask;
    });
});

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IFileStorageService, MinioStorageService>();

// --- Phase 10: Notifications & Alerts ---
// Регистрируем Telegram сервис как Singleton (так как это BackgroundService)
// и как INotificationService для внедрения зависимостей.
builder.Services.AddSingleton<TelegramBotService>();
builder.Services.AddHostedService<TelegramBotService>(provider => provider.GetRequiredService<TelegramBotService>());
builder.Services.AddSingleton<INotificationService>(provider => provider.GetRequiredService<TelegramBotService>());

builder.Services.AddScoped<IAlertService, AlertService>();
// ----------------------------------------

builder.Services.AddScoped<ICalculationService, CalculationService>();
builder.Services.AddScoped<IReportGenerator, RazorReportGenerator>();

// Quartz Configuration
builder.Services.AddQuartz(q =>
{
    q.UseMicrosoftDependencyInjectionJobFactory();

    var dailyReportJobKey = new JobKey("DailyReportJob");
    q.AddJob<DailyReportJob>(opts => opts.WithIdentity(dailyReportJobKey));

    q.AddTrigger(opts => opts
        .ForJob(dailyReportJobKey)
        .WithIdentity("DailyReportTrigger")
        .WithCronSchedule("0 0 6 * * ?"));
});

builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

// 3. Database & Identity
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? "Data Source=coop_monitor.db";

builder.Services.AddDbContext<CoopContext>(options =>
{
    options.UseSqlite(connectionString);
});

builder.Services.AddIdentity<User, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 4;
    })
    .AddEntityFrameworkStores<CoopContext>()
    .AddDefaultTokenProviders();

// 4. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidIssuer = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// 5. CORS Policy
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                     ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// 6. Configure Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseSerilogRequestLogging();
app.UseCors("AngularClient");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 7. Init DB
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var dbContext = services.GetRequiredService<CoopContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        dbContext.Database.Migrate();
        dbContext.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");

        string adminName = "admin";
        if (await userManager.FindByNameAsync(adminName) == null)
        {
            var adminUser = new User { UserName = adminName, Email = "admin@coop.local" };
            var result = await userManager.CreateAsync(adminUser, "admin123");
            if (result.Succeeded)
            {
                if (!await roleManager.RoleExistsAsync("Admin"))
                    await roleManager.CreateAsync(new IdentityRole("Admin"));

                await userManager.AddToRoleAsync(adminUser, "Admin");
                Log.Information("Default admin user created.");
            }
        }
    }

    Log.Information("Starting CoopMonitor API...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}