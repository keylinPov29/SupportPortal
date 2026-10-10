# Data Structure — Support Portal

Entity-Relationship model for the Support Portal back-office.

Database engine: **MySQL 8**

---

## Table: CLIENT

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique client identifier |
| document_number | VARCHAR(20) | UNIQUE, NOT NULL | Client document number (RUC) |
| business_name | VARCHAR(200) | NOT NULL | Legal business name |
| created_at | DATETIME | DEFAULT UTC_TIMESTAMP() | Record creation timestamp (UTC) |

---

## Table: ACCOUNT

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique account identifier |
| client_id | INT | FK → CLIENT.id, NOT NULL | Owner client |
| account_number | VARCHAR(20) | UNIQUE, NOT NULL | Bank account number |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | ACTIVE or BLOCKED |
| status_reason | VARCHAR(500) | NULL | Mandatory when status = BLOCKED |
| updated_at | DATETIME | DEFAULT UTC_TIMESTAMP() | Last update timestamp (UTC) |

---

## Table: ACCOUNTDETAIL (audit trail)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique history record identifier |
| account_id | INT | FK → ACCOUNT.id, NOT NULL | Related account |
| old_status | VARCHAR(20) | NULL | Previous status |
| new_status | VARCHAR(20) | NOT NULL | New status |
| status_reason | VARCHAR(500) | NULL | Reason for the change |
| changed_by | VARCHAR(100) | NULL | Operator who made the change |
| changed_at | DATETIME | DEFAULT UTC_TIMESTAMP() | Timestamp of the change (UTC) |

---

## Relationships

### Client (1) — (N) Account

- One client can have many accounts.
- Each account belongs to exactly one client.
- **Foreign Key:** `Account.client_id → Client.id`
- **On Delete:** CASCADE
- **On Update:** CASCADE
- **Mandatory:** Yes, `client_id` is NOT NULL

### Account (1) — (N) AccountDetail

- One account can have many status-change records.
- Each history record belongs to exactly one account.
- **Foreign Key:** `AccountDetail.account_id → Account.id`
- **On Delete:** CASCADE
- **On Update:** CASCADE
- **Mandatory:** Yes, `account_id` is NOT NULL

---

## Business Rules

1. A client can have zero or many accounts.
2. An account belongs to exactly one client.
3. Status can only be `ACTIVE` or `BLOCKED`.
4. When `status = BLOCKED`, `status_reason` is mandatory.
5. When `status = ACTIVE`, `status_reason` is cleared (NULL).
6. Every status change is logged in `AccountDetail` for audit purposes.
7. All timestamps are stored in **UTC** (`UTC_TIMESTAMP()`) to avoid timezone
   issues between the server, the database, and the client.

---

## ERD Diagram (textual)

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────────────┐
│     CLIENT      │         │     ACCOUNT      │         │   ACCOUNTDETAIL    │
├─────────────────┤         ├──────────────────┤         ├────────────────────┤
│ id (PK)         │───┐     │ id (PK)          │───┐     │ id (PK)            │
│ document_number │   │     │ client_id (FK)   │◀──┘     │ account_id (FK)    │◀──┐
│ business_name   │   └────▶│ account_number   │    └────│ old_status         │   │
│ created_at      │         │ status           │         │ new_status         │   │
└─────────────────┘         │ status_reason    │         │ status_reason      │   │
                            │ updated_at       │         │ changed_by         │   │
                            └──────────────────┘         │ changed_at         │   │
                                                          └────────────────────┘   │
                                                                                    │
                                          One Account ──▶ Many AccountDetail ────────┘
```
