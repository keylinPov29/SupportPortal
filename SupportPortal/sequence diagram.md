# Data Model

The system uses three relational tables to support the business logic of
the Support Portal.

---

## Table: CLIENT

| Field           | Type         | Constraints               | Description                     |
|-----------------|--------------|---------------------------|---------------------------------|
| id              | INT          | PK, IDENTITY              | Unique client identifier        |
| document_number | VARCHAR(20)  | UNIQUE, NOT NULL          | Client document number (RUC/DNI)|
| business_name   | VARCHAR(200) | NOT NULL                  | Legal business name             |
| created_at      | DATETIME     | DEFAULT GETDATE()         | Record creation timestamp       |

---

## Table: ACCOUNT

| Field          | Type         | Constraints                      | Description                          |
|----------------|--------------|----------------------------------|--------------------------------------|
| id             | INT          | PK, IDENTITY                     | Unique account identifier            |
| client_id      | INT          | FK → CLIENT.id, NOT NULL         | Owner client                         |
| account_number | VARCHAR(20)  | UNIQUE, NOT NULL                 | Bank account number                  |
| status         | VARCHAR(20)  | NOT NULL, DEFAULT 'ACTIVE'       | `ACTIVE` or `BLOCKED`                |
| status_reason  | VARCHAR(500) | NULL                             | Mandatory when status = `BLOCKED`    |
| updated_at     | DATETIME     | DEFAULT GETDATE()                | Last update timestamp                |

---

## Table: ACCOUNT_DETAIL

Stores the full status change history for each account (audit trail).

| Field          | Type         | Constraints                      | Description                          |
|----------------|--------------|----------------------------------|--------------------------------------|
| id             | INT          | PK, IDENTITY                     | Unique history record identifier     |
| account_id     | INT          | FK → ACCOUNT.id, NOT NULL        | Related account                      |
| old_status     | VARCHAR(20)  | NULL                             | Previous status                      |
| new_status     | VARCHAR(20)  | NOT NULL                         | New status                           |
| status_reason  | VARCHAR(500) | NULL                             | Reason for the change                |
| changed_by     | VARCHAR(100) | NULL                             | Operator who made the change         |
| changed_at     | DATETIME     | DEFAULT GETDATE()                | Timestamp of the change              |

---

## Relationships

- **CLIENT (1) — (N) ACCOUNT**: One client can have many accounts. Each account belongs to exactly one client.
  - **Foreign Key:** `ACCOUNT.client_id → CLIENT.id`
  - **On Delete:** CASCADE
  - **On Update:** NO ACTION (default)
  - **Mandatory:** Yes, `client_id` is NOT NULL

- **ACCOUNT (1) — (N) ACCOUNT_DETAIL**: One account can have many history records. Each record belongs to exactly one account.
  - **Foreign Key:** `ACCOUNT_DETAIL.account_id → ACCOUNT.id`
  - **On Delete:** CASCADE
  - **On Update:** NO ACTION (default)
  - **Mandatory:** Yes, `account_id` is NOT NULL

---

## Business Rules

1. A client can have zero or many accounts.
2. An account belongs to exactly one client.
3. Status can only be `ACTIVE` or `BLOCKED`.
4. When `status = BLOCKED`, `status_reason` is **mandatory**.
5. When `status = ACTIVE`, `status_reason` is cleared (set to NULL).
6. Every status change is recorded in `ACCOUNT_DETAIL` for audit purposes.