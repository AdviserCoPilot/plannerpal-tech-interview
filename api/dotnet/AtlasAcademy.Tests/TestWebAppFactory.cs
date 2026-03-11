using AtlasAcademy.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AtlasAcademy.Tests;

public class TestWebAppFactory(IAtlasRepository mockRepo)
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove all EF Core / DbContext registrations
            var efDescriptors = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AtlasDbContext>) ||
                    d.ServiceType == typeof(AtlasDbContext) ||
                    d.ServiceType.FullName?.Contains("EntityFramework") == true ||
                    d.ImplementationType?.FullName?.Contains("EntityFramework") == true)
                .ToList();
            foreach (var d in efDescriptors)
                services.Remove(d);

            // Remove the real repository registration
            var repoDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IAtlasRepository));
            if (repoDescriptor is not null)
                services.Remove(repoDescriptor);

            // Register the mock repository
            services.AddSingleton(mockRepo);
        });
    }
}
