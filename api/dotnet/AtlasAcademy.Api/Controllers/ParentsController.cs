using AtlasAcademy.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AtlasAcademy.Api.Controllers;

[ApiController]
[Route("parents")]
public class ParentsController(IParentService parentService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List() =>
        Ok(await parentService.ListAsync());
}
