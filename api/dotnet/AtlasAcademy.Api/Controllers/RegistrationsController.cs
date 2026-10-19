using AtlasAcademy.Api.Exceptions;
using AtlasAcademy.Api.Models;
using AtlasAcademy.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AtlasAcademy.Api.Controllers;

[ApiController]
[Route("registrations")]
public class RegistrationsController(IRegistrationService registrationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetByParent([FromQuery] Guid? parentId)
    {
        if (parentId is null)
            throw new ValidationException("parentId is required");

        var registrations = await registrationService.FindByParentAsync(parentId.Value);
        return Ok(new { registrations });
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll() =>
        Ok(await registrationService.FindAllAsync());

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        await registrationService.RegisterAsync(request.ClassId!.Value, request.ParentId!.Value);
        return StatusCode(StatusCodes.Status201Created, new
        {
            status = "registered",
            message = "Successfully registered for class"
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await registrationService.CancelAsync(id);
        return Ok(new { message = "Registration cancelled" });
    }
}
