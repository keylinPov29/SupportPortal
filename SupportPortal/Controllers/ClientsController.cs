using Microsoft.AspNetCore.Mvc;
using SupportPortal.Models.Dtos;
using SupportPortal.Services;

namespace SupportPortal.Controllers;

[ApiController]
[Route("api/clients")]
public class ClientsController : ControllerBase
{
    private readonly IClientService _service;

    public ClientsController(IClientService service)
    {
        _service = service;
    }

   
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string document = "")
    {
        try
        {
            var result = await _service.SearchClientsAsync(document ?? "");
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}