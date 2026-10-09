using SupportPortal.Models.Dtos;

namespace SupportPortal.Repositories
{
    public interface IClientRepository
    {
        Task<IEnumerable<ClientDto>> SearchClientsAsync(string documentNumber);
        Task UpdateAccountStatusAsync(int accountId, string status, string? reason);
    }
}
