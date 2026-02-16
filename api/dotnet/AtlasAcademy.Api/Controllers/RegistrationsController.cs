using AtlasAcademy.Api.Data;
using AtlasAcademy.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace AtlasAcademy.Api.Controllers;

[ApiController]
[Route("registrations")]
public class RegistrationsController(IAtlasRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetByParent([FromQuery] string? parentId)
    {
        if (string.IsNullOrWhiteSpace(parentId))
            return BadRequest(new { error = "parentId is required" });

        try
        {
            if (!Guid.TryParse(parentId, out var guid))
                return BadRequest(new { error = "Invalid parentId" });

            var registrations = await repo.GetRegistrationsByParentAsync(guid);
            return Ok(new { registrations });
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to fetch registrations" });
        }
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var registrations = await repo.GetAllRegistrationsAsync();
            return Ok(registrations);
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to fetch all registrations" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ClassId) || string.IsNullOrWhiteSpace(request.ParentId))
            return BadRequest(new { error = "classId and parentId are required" });

        try
        {
            if (!Guid.TryParse(request.ClassId, out var classId) ||
                !Guid.TryParse(request.ParentId, out var parentId))
                return BadRequest(new { error = "Invalid classId or parentId" });

            var capacity = await repo.GetClassCapacityAsync(classId);
            if (capacity < 0)
                return NotFound(new { error = "Class not found" });

            var currentCount = await repo.CountRegisteredAsync(classId);
            if (currentCount >= capacity)
                return Conflict(new { error = "Class is full" });

            await repo.RegisterAsync(classId, parentId);
            return StatusCode(201, new { status = "registered", message = "Successfully registered for class" });
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to register" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Cancel(string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
                return NotFound(new { error = "Registration not found" });

            if (!await repo.RegistrationExistsActiveAsync(guid))
                return NotFound(new { error = "Registration not found" });

            await repo.CancelRegistrationAsync(guid);
            return Ok(new { message = "Registration cancelled" });
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to cancel registration" });
        }
    }
}
