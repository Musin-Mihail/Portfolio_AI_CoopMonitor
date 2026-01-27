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

// 2. Add services
builder.Services.AddControllers();

// OpenAPI
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
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
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

// Notifications & Alerts
builder.Services.AddSingleton<TelegramBotService>();
builder.Services.AddHostedService<TelegramBotService>(provider => provider.GetRequiredService<TelegramBotService>());
builder.Services.AddSingleton<INotificationService>(provider => provider.GetRequiredService<TelegramBotService>());
builder.Services.AddScoped<IAlertService, AlertService>();

builder.Services.AddScoped<ICalculationService, CalculationService>();
builder.Services.AddScoped<IReportGenerator, RazorReportGenerator>();

// Audit Service (Scoped because it might use HttpContext accessor logic in future, but implementing as separate creates scope internally)
// However, we inject it into Controllers. Let's keep it Transient or Singleton since it creates its own Scope for DB access.
builder.Services.AddSingleton<IAuditService, AuditService>();

// Quartz
builder.Services.AddQuartz(q =>
{
    var dailyReportJobKey = new JobKey("DailyReportJob");
    q.AddJob<DailyReportJob>(opts => opts.WithIdentity(dailyReportJobKey));
    q.AddTrigger(opts => opts.ForJob(dailyReportJobKey).WithIdentity("DailyReportTrigger").WithCronSchedule("0 0 6 * * ?"));

    var backupJobKey = new JobKey("BackupJob");
    q.AddJob<BackupJob>(opts => opts.WithIdentity(backupJobKey));
    q.AddTrigger(opts => opts.ForJob(backupJobKey).WithIdentity("BackupTrigger").WithCronSchedule("0 0 2 * * ?"));

    var cleanupJobKey = new JobKey("CleanupJob");
    q.AddJob<CleanupJob>(opts => opts.WithIdentity(cleanupJobKey));
    q.AddTrigger(opts => opts.ForJob(cleanupJobKey).WithIdentity("CleanupTrigger").WithCronSchedule("0 0 3 * * ?"));
});
builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

// 3. Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=coop_monitor.db";
builder.Services.AddDbContext<CoopContext>(options => options.UseSqlite(connectionString));

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 4;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
.AddEntityFrameworkStores<CoopContext>()
.AddDefaultTokenProviders();

// 4. JWT Auth
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidIssuer = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };

    // Чтение токена из Query String (для видео плеера и скачивания)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            // Если запрос идет к API файлов и есть токен в URL
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/api/Files"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// 5. CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:4200"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

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

// Init DB
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<CoopContext>();
        var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleMgr = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        db.Database.Migrate();
        db.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");

        if (await userMgr.FindByNameAsync("admin") == null)
        {
            var admin = new User { UserName = "admin", Email = "admin@coop.local" };
            if ((await userMgr.CreateAsync(admin, "admin123")).Succeeded)
            {
                if (!await roleMgr.RoleExistsAsync("Admin")) await roleMgr.CreateAsync(new IdentityRole("Admin"));
                await userMgr.AddToRoleAsync(admin, "Admin");
            }
        }
    }
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "App crash");
}
finally
{
    Log.CloseAndFlush();
}