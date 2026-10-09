namespace SupportPortal.Models.Dtos
{
    public class UpdateAccountStatus
    {
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }
}
