using Microsoft.Data.SqlClient;
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
        using var connection = new SqlConnection(_connectionString);

        return await connection.QueryAsync<ClientDto>(
            "sp_search_clients",
            new { document_number = documentNumber },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task UpdateAccountStatusAsync(int accountId, string status, string? reason)
    {
        using var connection = new SqlConnection(_connectionString);

        await connection.ExecuteAsync(
            "sp_update_account_status",
            new
            {
                account_id = accountId,
                status = status,
                status_reason = reason
            },
            commandType: CommandType.StoredProcedure
        );
    }
}

