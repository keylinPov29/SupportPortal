using SupportPortal.Models.Dtos;
using SupportPortal.Repositories;

namespace SupportPortal.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _repository;

    public ClientService(IClientRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ClientDto>> SearchClientsAsync(string documentNumber)
    {
        if (string.IsNullOrWhiteSpace(documentNumber))
            throw new ArgumentException("Document number is required.");

        return await _repository.SearchClientsAsync(documentNumber.Trim());
    }

    public async Task UpdateAccountStatusAsync(int accountId, UpdateAccountStatus request)
    {
        if (request is null)
            throw new ArgumentException("Request body is required.");

        // Business rule: reason is mandatory when blocking
        if (request.Status == "BLOCKED" && string.IsNullOrWhiteSpace(request.Reason))
            throw new ArgumentException("Reason is required when blocking an account.");

        // Validate status value
        if (request.Status != "ACTIVE" && request.Status != "BLOCKED")
            throw new ArgumentException("Invalid status. Allowed values: ACTIVE, BLOCKED.");

        await _repository.UpdateAccountStatusAsync(accountId, request.Status, request.Reason);
    }
}