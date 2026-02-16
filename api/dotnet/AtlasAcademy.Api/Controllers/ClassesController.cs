using AtlasAcademy.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace AtlasAcademy.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController(IAtlasRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        try
        {
            var classes = await repo.GetClassesAsync();
            return Ok(classes);
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to fetch classes" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        try
        {
            if (!Guid.TryParse(id, out var guid))
                return NotFound(new { error = "Class not found" });

            var cls = await repo.GetClassByIdAsync(guid);
            if (cls is null)
                return NotFound(new { error = "Class not found" });

            return Ok(cls);
        }
        catch
        {
            return StatusCode(500, new { error = "Failed to fetch class" });
        }
    }
}
