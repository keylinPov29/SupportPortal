namespace SupportPortal.Models.Dtos;

public class AccountHistoryDto
{
    public int HistoryId { get; set; }
    public int AccountId { get; set; }
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? StatusReason { get; set; }
    public string? ChangedBy { get; set; }
    public DateTime ChangedAt { get; set; }
}