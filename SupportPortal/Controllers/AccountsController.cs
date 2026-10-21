using Microsoft.AspNetCore.Mvc;
using SupportPortal.Models.Dtos;
using SupportPortal.Services;

namespace SupportPortal.Controllers;

[ApiController]
[Route("api/accounts")]
public class AccountsController : ControllerBase
{
    private readonly IClientService _service;

    public AccountsController(IClientService service)
    {
        _service = service;
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAccountStatus request)
    {
        try
        {
            await _service.UpdateAccountStatusAsync(id, request);
            return Ok(new { message = "Account status updated successfully." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        try
        {
            var history = await _service.GetAccountHistoryAsync(id);
            return Ok(history);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}