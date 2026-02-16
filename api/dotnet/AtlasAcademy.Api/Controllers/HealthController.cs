using Microsoft.AspNetCore.Mvc;

namespace AtlasAcademy.Api.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("/health")]
    public IActionResult Health() => Ok(new { status = "ok" });
}
