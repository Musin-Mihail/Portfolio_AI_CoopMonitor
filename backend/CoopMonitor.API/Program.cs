using CoopMonitor.API.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Setup Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// 2. Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Database Context (SQLite)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? "Data Source=coop_monitor.db";

builder.Services.AddDbContext<CoopContext>(options =>
{
    options.UseSqlite(connectionString);
});

// 4. CORS Policy
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

// 5. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseCors("AngularClient");

app.UseAuthorization();

app.MapControllers();

// 6. Database Initialization (Migrations & WAL Mode)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<CoopContext>();

        // Apply pending migrations
        dbContext.Database.Migrate();

        // Enable WAL Journal Mode for performance
        // This must be executed as a raw SQL command for SQLite
        dbContext.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");

        Log.Information("Database migrated and WAL mode enabled.");
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