using SupportPortal.Models.Dtos;
using SupportPortal.Repositories;

namespace SupportPortal.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _repository;
    private readonly ILogger<ClientService> _logger;

    public ClientService(IClientRepository repository, ILogger<ClientService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<ClientDto>> SearchClientsAsync(string documentNumber)
    {
        try
        {
            // Allow empty search to return all records
            var term = (documentNumber ?? "").Trim();
            _logger.LogInformation("Searching clients with term: {Term}", term);
            return await _repository.SearchClientsAsync(term);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching clients with term: {Term}", documentNumber);
            throw;
        }
    }

    public async Task UpdateAccountStatusAsync(int accountId, UpdateAccountStatus request)
    {
        // Business validation
        if (request is null)
            throw new ArgumentException("Request body is required.");

        if (request.Status != "ACTIVE" && request.Status != "BLOCKED")
            throw new ArgumentException("Invalid status. Allowed values: ACTIVE, BLOCKED.");

        if (request.Status == "BLOCKED" && string.IsNullOrWhiteSpace(request.Reason))
            throw new ArgumentException("Reason is required when blocking an account.");

        try
        {
            _logger.LogInformation(
                "Updating account {AccountId} status to {Status}",
                accountId, request.Status);

            await _repository.UpdateAccountStatusAsync(accountId, request.Status, request.Reason);
        }
        catch (ArgumentException)
        {
            // Re-throw business validation errors
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unexpected error updating account {AccountId} to status {Status}",
                accountId, request.Status);
            throw; // Re-throw for the global middleware
        }
    }
}