using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CoopMonitor.API.Data;

/// <summary>
/// Фабрика для создания DbContext во время разработки (Design-time).
/// Используется инструментами EF Core (dotnet ef migrations) для создания контекста
/// без необходимости запуска всего приложения (Program.cs).
/// </summary>
public class CoopContextFactory : IDesignTimeDbContextFactory<CoopContext>
{
    public CoopContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<CoopContext>();

        // Используем строку подключения по умолчанию для разработки
        // Важно: в Production строка будет браться из appsettings.json
        optionsBuilder.UseSqlite("Data Source=coop_monitor.db;Cache=Shared");

        return new CoopContext(optionsBuilder.Options);
    }
}