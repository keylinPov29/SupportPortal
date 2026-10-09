-- =============================================
-- Database: SupportPortalDb
-- Stored Procedures
-- =============================================

USE SupportPortalDb;
GO

-- ---------- sp_search_clients ----------
CREATE OR ALTER PROCEDURE sp_search_clients
    @document_number VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        c.id              AS ClientId,
        c.document_number AS DocumentNumber,
        c.business_name   AS BusinessName,
        a.id              AS AccountId,
        a.account_number  AS AccountNumber,
        a.status          AS Status,
        a.status_reason   AS StatusReason,
        a.updated_at      AS UpdatedAt
    FROM dbo.Client c
    LEFT JOIN dbo.Account a ON a.client_id = c.id
    WHERE c.document_number LIKE '%' + @document_number + '%'
    ORDER BY c.id, a.id;
END
GO

-- ---------- sp_update_account_status ----------
CREATE OR ALTER PROCEDURE sp_update_account_status
    @account_id    INT,
    @status        VARCHAR(20),
    @status_reason VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Validate status value
    IF @status NOT IN ('ACTIVE', 'BLOCKED')
    BEGIN
        RAISERROR('Invalid status. Allowed values: ACTIVE, BLOCKED.', 16, 1);
        RETURN;
    END

    -- Validate reason is required when blocking
    IF @status = 'BLOCKED' AND (@status_reason IS NULL OR LTRIM(RTRIM(@status_reason)) = '')
    BEGIN
        RAISERROR('Reason is required when blocking an account.', 16, 1);
        RETURN;
    END

    -- Check if account exists
    IF NOT EXISTS (SELECT 1 FROM dbo.Account WHERE id = @account_id)
    BEGIN
        RAISERROR('Account not found.', 16, 1);
        RETURN;
    END

    -- Clear reason when activating
    IF @status = 'ACTIVE'
        SET @status_reason = NULL;

    -- Update the account
    UPDATE dbo.Account
    SET status = @status,
        status_reason = @status_reason,
        updated_at = GETDATE()
    WHERE id = @account_id;
END
GO