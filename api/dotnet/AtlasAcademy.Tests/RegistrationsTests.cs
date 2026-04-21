using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Models;
using NSubstitute;

namespace AtlasAcademy.Tests;

public class RegistrationsTests
{
    private static IAtlasRepository CreateMockRepo() => Substitute.For<IAtlasRepository>();

    [Fact]
    public async Task GetRegistrations_RequiresParentId()
    {
        var repo = CreateMockRepo();
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/registrations");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("parentId is required", json.RootElement.GetProperty("error").GetString());
    }

    [Fact]
    public async Task GetRegistrations_WithParentId()
    {
        var parentId = Guid.NewGuid();
        var repo = CreateMockRepo();
        repo.GetRegistrationsByParentAsync(parentId).Returns([
            new Registration(Guid.NewGuid(), Guid.NewGuid(), "registered", "Yoga 101")
        ]);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync($"/registrations?parentId={parentId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var first = json.RootElement.GetProperty("registrations")[0];
        Assert.Equal("Yoga 101", first.GetProperty("class_name").GetString());
        Assert.Equal("registered", first.GetProperty("status").GetString());
    }

    [Fact]
    public async Task GetAllRegistrations_ReturnsList()
    {
        var repo = CreateMockRepo();
        repo.GetAllRegistrationsAsync().Returns([
            new AdminRegistration(
                Guid.NewGuid(), Guid.NewGuid(), "Yoga 101",
                "Alice Smith", "alice@example.com", DateTimeOffset.UtcNow)
        ]);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/registrations/all");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("Yoga 101", json.RootElement[0].GetProperty("class_name").GetString());
        Assert.Equal("Alice Smith", json.RootElement[0].GetProperty("parent_name").GetString());
    }

    [Fact]
    public async Task Register_MissingFields()
    {
        var repo = CreateMockRepo();
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/registrations", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_ClassNotFound()
    {
        var classId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var repo = CreateMockRepo();
        repo.ParentExistsAsync(parentId).Returns(true);
        repo.RegisterWithLockAsync(classId, parentId).Returns(RegisterOutcome.ClassNotFound);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/registrations",
            new { class_id = classId.ToString(), parent_id = parentId.ToString() });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Register_Success()
    {
        var classId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var repo = CreateMockRepo();
        repo.ParentExistsAsync(parentId).Returns(true);
        repo.RegisterWithLockAsync(classId, parentId).Returns(RegisterOutcome.Registered);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/registrations",
            new { class_id = classId.ToString(), parent_id = parentId.ToString() });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("registered", json.RootElement.GetProperty("status").GetString());
        await repo.Received(1).RegisterWithLockAsync(classId, parentId);
    }

    [Fact]
    public async Task Register_ClassFull()
    {
        var classId = Guid.NewGuid();
        var parentId = Guid.NewGuid();
        var repo = CreateMockRepo();
        repo.ParentExistsAsync(parentId).Returns(true);
        repo.RegisterWithLockAsync(classId, parentId).Returns(RegisterOutcome.ClassFull);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/registrations",
            new { class_id = classId.ToString(), parent_id = parentId.ToString() });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Cancel_Success()
    {
        var regId = Guid.NewGuid();
        var repo = CreateMockRepo();
        repo.CancelRegistrationAsync(regId).Returns(true);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.DeleteAsync($"/registrations/{regId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await repo.Received(1).CancelRegistrationAsync(regId);
    }

    [Fact]
    public async Task Cancel_NotFound()
    {
        var regId = Guid.NewGuid();
        var repo = CreateMockRepo();
        repo.CancelRegistrationAsync(regId).Returns(false);
        await using var factory = new TestWebAppFactory(repo);
        var client = factory.CreateClient();

        var response = await client.DeleteAsync($"/registrations/{regId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
