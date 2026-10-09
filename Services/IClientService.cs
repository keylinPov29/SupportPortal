using SupportPortal.Models.Dtos;

namespace SupportPortal.Services;

public interface IClientService
{
    Task<IEnumerable<ClientDto>> SearchClientsAsync(string documentNumber);
    Task UpdateAccountStatusAsync(int accountId, UpdateAccountStatus request);
}