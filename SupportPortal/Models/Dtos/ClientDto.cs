namespace SupportPortal.Models.Dtos;

public class ClientDto
{
    public int ClientId { get; set; }
    public string DocumentNumber { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public int? AccountId { get; set; }
    public string? AccountNumber { get; set; }
    public string? Status { get; set; }
    public string? StatusReason { get; set; }
    public DateTime? UpdatedAt { get; set; }
}