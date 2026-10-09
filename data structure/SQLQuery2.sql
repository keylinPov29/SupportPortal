USE SupportPortalDb;
GO

CREATE TABLE dbo.Client (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    document_number VARCHAR(20)  NOT NULL UNIQUE,
    business_name   VARCHAR(200) NOT NULL,
    created_at      DATETIME     NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.Account (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    client_id      INT          NOT NULL,
    account_number VARCHAR(20)  NOT NULL UNIQUE,
    status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    status_reason  VARCHAR(500) NULL,
    updated_at     DATETIME     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT fk_account_client
        FOREIGN KEY (client_id)
        REFERENCES dbo.Client(id)
);
GO

INSERT INTO dbo.Client (document_number, business_name)
VALUES
    ('20512447895', 'Inversiones Andina SAC'),
    ('20487720113', 'Textiles del Sur SA'),
    ('20601188234', 'Comercial Pacifico EIRL'),
    ('20559930871', 'AgroExport Norte SAC'),
    ('20100011223', 'Servicios Generales Lima SAC'),
    ('20223344556', 'Distribuidora Central SA'),
    ('20334455667', 'Tecnologia del Pacifico SAC'),
    ('20445566778', 'Importaciones del Norte EIRL');
GO

INSERT INTO dbo.Account
    (client_id, account_number, status, status_reason)
VALUES
    (1, '194-8841', 'ACTIVE', NULL),
    (2, '194-9032', 'BLOCKED', 'Suspicious operation reported'),
    (3, '194-7715', 'ACTIVE', NULL),
    (4, '194-6620', 'ACTIVE', NULL),
    (5, '194-8855', 'ACTIVE', NULL),
    (6, '194-9067', 'ACTIVE', NULL),
    (7, '194-7782', 'BLOCKED', 'Suspicious operation reported'),
    (8, '194-6691', 'ACTIVE', NULL);
GO