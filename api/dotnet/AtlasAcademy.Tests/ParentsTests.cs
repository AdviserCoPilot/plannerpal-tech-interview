using System.Net;
using System.Text.Json;
using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Models;
using NSubstitute;

namespace AtlasAcademy.Tests;

public class ParentsTests
{
    [Fact]
    public async Task ListParents_ReturnsParents()
    {
        var repo = Substitute.For<IAtlasRepository>();
        repo.GetParentsAsync().Returns([
            new Parent(Guid.NewGuid(), "alice@example.com", "Alice Smith")
        ]);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/parents");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var first = json.RootElement[0];
        Assert.Equal("Alice Smith", first.GetProperty("name").GetString());
        Assert.Equal("alice@example.com", first.GetProperty("email").GetString());
    }
}
