using AtlasAcademy.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace AtlasAcademy.Api.Controllers;

[ApiController]
[Route("parents")]
public class ParentsController(IAtlasRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        try
        {
            var parents = await repo.GetParentsAsync();
            return Ok(parents);
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to fetch parents" });
        }
    }
}
