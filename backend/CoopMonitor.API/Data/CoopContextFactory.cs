using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CoopMonitor.API.Data;

public class CoopContextFactory : IDesignTimeDbContextFactory<CoopContext>
{
    public CoopContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<CoopContext>();
        optionsBuilder.UseSqlite("Data Source=coop_monitor.db;Cache=Shared");

        return new CoopContext(optionsBuilder.Options);
    }
}