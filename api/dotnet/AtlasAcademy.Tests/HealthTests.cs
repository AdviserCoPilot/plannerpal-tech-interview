using System.Net;
using System.Text.Json;
using AtlasAcademy.Api.Data;
using NSubstitute;

namespace AtlasAcademy.Tests;

public class HealthTests
{
    [Fact]
    public async Task Health_ReturnsOk()
    {
        var repo = Substitute.For<IAtlasRepository>();
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("ok", json.RootElement.GetProperty("status").GetString());
    }
}
