using MySqlConnector;
using Dapper;
using SupportPortal.Models.Dtos;
using System.Data;

namespace SupportPortal.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly string _connectionString;

    public ClientRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }

    public async Task<IEnumerable<ClientDto>> SearchClientsAsync(string documentNumber)
    {
        using var connection = new MySqlConnection(_connectionString);

        var clients = await connection.QueryAsync<ClientDto>(
            "sp_search_clients",
            new { p_search_term = documentNumber ?? "" },
            commandType: CommandType.StoredProcedure
        );

        // Mark dates as UTC so the JSON includes the "Z" suffix
        foreach (var client in clients)
        {
            if (client.UpdatedAt.HasValue)
            {
                client.UpdatedAt = DateTime.SpecifyKind(client.UpdatedAt.Value, DateTimeKind.Utc);
            }
        }

        return clients;
    }

    public async Task UpdateAccountStatusAsync(int accountId, string status, string? reason)
    {
        using var connection = new MySqlConnection(_connectionString);

        await connection.ExecuteAsync(
            "sp_update_account_status",
            new
            {
                p_account_id = accountId,
                p_status = status,
                p_status_reason = reason,
                p_changed_by = "Operator"
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<AccountHistoryDto>> GetAccountHistoryAsync(int accountId)
    {
        using var connection = new MySqlConnection(_connectionString);

        var history = await connection.QueryAsync<AccountHistoryDto>(
            "sp_get_account_status_history",
            new { p_account_id = accountId },
            commandType: CommandType.StoredProcedure
        );

        // Mark dates as UTC
        foreach (var record in history)
        {
            record.ChangedAt = DateTime.SpecifyKind(record.ChangedAt, DateTimeKind.Utc);
        }

        return history;
    }
}