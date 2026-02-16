using AtlasAcademy.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace AtlasAcademy.Tests;

public class TestWebAppFactory(IAtlasRepository mockRepo)
    : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IAtlasRepository));
            if (descriptor is not null)
                services.Remove(descriptor);

            services.AddSingleton(mockRepo);
        });
    }
}
