USE SupportPortalDb;

-- ============================================
-- Drop procedures if they exist
-- ============================================
DROP PROCEDURE IF EXISTS sp_search_clients;
DROP PROCEDURE IF EXISTS sp_update_account_status;
DROP PROCEDURE IF EXISTS sp_get_account_status_history;

-- ============================================
-- sp_search_clients
-- Same behavior as SQL Server version
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_search_clients(IN p_search_term VARCHAR(100))
BEGIN
    DECLARE v_pattern VARCHAR(102);

    IF p_search_term IS NULL OR TRIM(p_search_term) = '' THEN
        SET v_pattern = '%';
    ELSE
        SET v_pattern = CONCAT('%', TRIM(p_search_term), '%');
    END IF;

    SELECT
        c.id              AS ClientId,
        c.document_number AS DocumentNumber,
        c.business_name   AS BusinessName,
        a.id              AS AccountId,
        a.account_number  AS AccountNumber,
        a.status          AS Status,
        a.status_reason   AS StatusReason,
        a.updated_at      AS UpdatedAt
    FROM Client c
    LEFT JOIN Account a ON a.client_id = c.id
    WHERE c.document_number LIKE v_pattern
       OR c.business_name   LIKE v_pattern
    ORDER BY c.id, a.id;
END //
DELIMITER ;

-- ============================================
-- sp_update_account_status
-- Validates status and reason, updates account,
-- and logs the change to AccountDetail
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_update_account_status(
    IN p_account_id    INT,
    IN p_status        VARCHAR(20),
    IN p_status_reason VARCHAR(500),
    IN p_changed_by    VARCHAR(100)
)
BEGIN
    DECLARE v_old_status  VARCHAR(20);
    DECLARE v_account_count INT;

    -- 1. Validate status value
    IF p_status NOT IN ('ACTIVE', 'BLOCKED') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid status. Allowed values: ACTIVE, BLOCKED.';
    END IF;

    -- 2. Reason is required when blocking
    IF p_status = 'BLOCKED' AND (p_status_reason IS NULL OR TRIM(p_status_reason) = '') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Reason is required when blocking an account.';
    END IF;

    -- 3. Check if the account exists
    SELECT COUNT(*) INTO v_account_count FROM Account WHERE id = p_account_id;
    IF v_account_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Account not found.';
    END IF;

    -- 4. If status is ACTIVE, clear the reason
    IF p_status = 'ACTIVE' THEN
        SET p_status_reason = NULL;
    END IF;

    -- 5. Capture current status
    SELECT status INTO v_old_status FROM Account WHERE id = p_account_id;

    -- 6. Update the account
    UPDATE Account
    SET status        = p_status,
        status_reason = p_status_reason,
        updated_at    = CURRENT_TIMESTAMP
    WHERE id = p_account_id;

    -- 7. Log the change
    INSERT INTO AccountDetail (account_id, old_status, new_status, status_reason, changed_by)
    VALUES (p_account_id, v_old_status, p_status, p_status_reason, p_changed_by);
END //
DELIMITER ;

-- ============================================
-- sp_get_account_status_history
-- Returns the status change history for an account
-- ============================================
DELIMITER //
CREATE PROCEDURE sp_get_account_status_history(IN p_account_id INT)
BEGIN
    SELECT
        d.id            AS historyId,
        d.account_id    AS accountId,
        d.old_status    AS oldStatus,
        d.new_status    AS newStatus,
        d.status_reason AS statusReason,
        d.changed_by    AS changedBy,
        d.changed_at    AS changedAt
    FROM AccountDetail d
    WHERE d.account_id = p_account_id
    ORDER BY d.changed_at DESC;
END //
DELIMITER ;