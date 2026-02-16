using System.Net;
using System.Text.Json;
using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Models;
using NSubstitute;

namespace AtlasAcademy.Tests;

public class ClassesTests
{
    private static ClassEntity SampleClass(Guid? id = null) => new(
        id ?? Guid.NewGuid(), "Yoga 101", "Beginner yoga", 20,
        DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(1),
        DateTimeOffset.UtcNow, 5
    );

    [Fact]
    public async Task ListClasses_ReturnsClasses()
    {
        var repo = Substitute.For<IAtlasRepository>();
        repo.GetClassesAsync().Returns([SampleClass()]);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/classes");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var first = json.RootElement[0];
        Assert.Equal("Yoga 101", first.GetProperty("name").GetString());
        Assert.Equal(20, first.GetProperty("capacity").GetInt32());
        Assert.Equal(5, first.GetProperty("registered_count").GetInt64());
    }

    [Fact]
    public async Task GetClassById_ReturnsClass()
    {
        var id = Guid.NewGuid();
        var repo = Substitute.For<IAtlasRepository>();
        repo.GetClassByIdAsync(id).Returns(SampleClass(id));
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/classes/{id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("Yoga 101", json.RootElement.GetProperty("name").GetString());
    }

    [Fact]
    public async Task GetClassById_NotFound()
    {
        var id = Guid.NewGuid();
        var repo = Substitute.For<IAtlasRepository>();
        repo.GetClassByIdAsync(id).Returns((ClassEntity?)null);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/classes/{id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
