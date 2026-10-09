Table: CLIENT

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PK, IDENTITY | Unique client identifier |
| document_number | VARCHAR(20) | UNIQUE, NOT NULL | Client document number |
| business_name | VARCHAR(200) | NOT NULL | Legal business name |
| created_at | DATETIME | DEFAULT GETDATE() | Record creation timestamp |

Table: ACCOUNT

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PK, IDENTITY | Unique account identifier |
| client_id | INT | FK → CLIENT.id, NOT NULL | Owner client |
| account_number | VARCHAR(20) | UNIQUE, NOT NULL | Bank account number |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | ACTIVE or BLOCKED |
| status_reason | VARCHAR(500) | NULL | Mandatory when status = BLOCKED |
| updated_at | DATETIME | DEFAULT GETDATE() | Last update timestamp |

Relationship

- **Client (1) — (N) Account**: One client can have many accounts. Each account belongs to exactly one client.
- **Foreign Key:** Account.client_id → Client.id
- **On Delete:** CASCADE
- **On Update:** CASCADE
- **Mandatory:** Yes, client_id is NOT NULL

 Business Rules

1. A client can have zero or many accounts.
2. An account belongs to exactly one client.
3. Status can only be `ACTIVE` or `BLOCKED`.
4. When status = `BLOCKED`, `status_reason` is mandatory.
5. When status = `ACTIVE`, `status_reason` is cleared (NULL).
