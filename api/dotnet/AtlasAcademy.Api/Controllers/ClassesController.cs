using AtlasAcademy.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AtlasAcademy.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController(IClassService classService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List() =>
        Ok(await classService.ListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) =>
        Ok(await classService.GetByIdAsync(id));
}
