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

    /// <summary>
    /// Update the status of an account.
    /// </summary>
    /// <param name="id">Account ID</param>
    /// <param name="request">Status and optional reason</param>
    /// <returns>Success message</returns>
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
}