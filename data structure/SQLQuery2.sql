USE railway;

DROP TABLE IF EXISTS AccountDetail;
DROP TABLE IF EXISTS Account;
DROP TABLE IF EXISTS Client;

CREATE TABLE Client (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    document_number VARCHAR(20)  NOT NULL UNIQUE,
    business_name   VARCHAR(200) NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Account (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    client_id      INT          NOT NULL,
    account_number VARCHAR(20)  NOT NULL UNIQUE,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    status_reason  VARCHAR(500) NULL,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_account_client
        FOREIGN KEY (client_id) REFERENCES Client(id) ON DELETE CASCADE
);

CREATE TABLE AccountDetail (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    account_id    INT           NOT NULL,
    old_status    VARCHAR(20)   NULL,
    new_status    VARCHAR(20)   NOT NULL,
    status_reason VARCHAR(500)  NULL,
    changed_by    VARCHAR(100)  NULL,
    changed_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_detail_account
        FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE
);

INSERT INTO Client (document_number, business_name) VALUES
    ('20512447895', 'Inversiones Andina SAC'),
    ('20487720113', 'Textiles del Sur SA'),
    ('20601188234', 'Comercial Pacifico EIRL'),
    ('20559930871', 'AgroExport Norte SAC'),
    ('20100011223', 'Servicios Generales Lima SAC'),
    ('20223344556', 'Distribuidora Central SA'),
    ('20334455667', 'Tecnologia del Pacifico SAC'),
    ('20445566778', 'Importaciones del Norte EIRL');

INSERT INTO Account (client_id, account_number, status, status_reason) VALUES
    (1, '194-8841', 'ACTIVE',  NULL),
    (1, '194-8842', 'ACTIVE',  NULL),
    (1, '194-8843', 'ACTIVE',  NULL),
    (1, '194-8844', 'BLOCKED', 'Suspicious international transfer'),
    (2, '194-9032', 'BLOCKED', 'Suspicious operation reported'),
    (2, '194-9033', 'ACTIVE',  NULL),
    (2, '194-9034', 'ACTIVE',  NULL),
    (3, '194-7715', 'ACTIVE',  NULL),
    (4, '194-6620', 'ACTIVE',  NULL),
    (5, '194-8855', 'ACTIVE',  NULL),
    (6, '194-9067', 'ACTIVE',  NULL),
    (7, '194-7782', 'BLOCKED', 'Suspicious operation reported'),
    (7, '194-7783', 'ACTIVE',  NULL),
    (7, '194-7784', 'BLOCKED', 'Unusual withdrawal pattern'),
    (7, '194-7785', 'ACTIVE',  NULL),
    (8, '194-6691', 'ACTIVE',  NULL);

INSERT INTO AccountDetail (account_id, old_status, new_status, status_reason, changed_by) VALUES
    (1, NULL, 'ACTIVE', NULL, 'System'),
    (2, NULL, 'ACTIVE', NULL, 'System'),
    (3, NULL, 'ACTIVE', NULL, 'System'),
    (4, NULL, 'ACTIVE', NULL, 'System'),
    (4, 'ACTIVE', 'BLOCKED', 'Suspicious international transfer', 'System'),
    (5, NULL, 'ACTIVE', NULL, 'System'),
    (5, 'ACTIVE', 'BLOCKED', 'Suspicious operation reported', 'System'),
    (6, NULL, 'ACTIVE', NULL, 'System'),
    (7, NULL, 'ACTIVE', NULL, 'System'),
    (8, NULL, 'ACTIVE', NULL, 'System'),
    (9, NULL, 'ACTIVE', NULL, 'System'),
    (10, NULL, 'ACTIVE', NULL, 'System'),
    (11, NULL, 'ACTIVE', NULL, 'System'),
    (12, NULL, 'ACTIVE', NULL, 'System'),
    (12, 'ACTIVE', 'BLOCKED', 'Suspicious operation reported', 'System'),
    (13, NULL, 'ACTIVE', NULL, 'System'),
    (14, NULL, 'ACTIVE', NULL, 'System'),
    (14, 'ACTIVE', 'BLOCKED', 'Unusual withdrawal pattern', 'System'),
    (15, NULL, 'ACTIVE', NULL, 'System'),
    (16, NULL, 'ACTIVE', NULL, 'System');
