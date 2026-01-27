using System.Text;
using CoopMonitor.API.Data;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Setup Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// 2. Add services to the container
builder.Services.AddControllers();
// Заменяем Swagger на Native OpenAPI
builder.Services.AddOpenApi();

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IFileStorageService, MinioStorageService>();

// 3. Database Context (SQLite) & Identity
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? "Data Source=coop_monitor.db";

builder.Services.AddDbContext<CoopContext>(options =>
{
    options.UseSqlite(connectionString);
});

// Настройка Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 4; // Упрощенные требования для MVP
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

// 6. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    // Используем Native OpenAPI + Scalar UI вместо SwaggerUI
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseSerilogRequestLogging();
app.UseCors("AngularClient");

app.UseAuthentication(); // Добавлено Authentication Middleware
app.UseAuthorization();

app.MapControllers();

// 7. Database Initialization (Migrations, WAL Mode & Seeding)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var dbContext = services.GetRequiredService<CoopContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        // Apply pending migrations
        dbContext.Database.Migrate();

        // Enable WAL Journal Mode
        dbContext.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");

        // Seed Default Admin
        string adminName = "admin";
        if (await userManager.FindByNameAsync(adminName) == null)
        {
            var adminUser = new User { UserName = adminName, Email = "admin@coop.local" };
            var result = await userManager.CreateAsync(adminUser, "admin123"); // Пароль
            if (result.Succeeded)
            {
                // Ensure Role Exists (Optional for now)
                if (!await roleManager.RoleExistsAsync("Admin"))
                    await roleManager.CreateAsync(new IdentityRole("Admin"));

                await userManager.AddToRoleAsync(adminUser, "Admin");
                Log.Information("Default admin user created.");
            }
            else
            {
                Log.Error("Failed to create admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        Log.Information("Database migrated and initialized.");
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