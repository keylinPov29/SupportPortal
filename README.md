# Support Portal — Business Banking

Internal back-office portal for the technical support team to search corporate
clients, view their accounts, and manage their operational status
(e.g., Active, Blocked due to fraud).

Built as part of the **DTP-L1-2026** technical challenge — Level 1.

---

## Tech Stack

| Layer       | Technology                |
|-------------|---------------------------|
| Frontend    | React 18 + Vite           |
| Backend     | .NET 8 (C#) Web API       |
| Database    | SQL Server                |
| Deployment  | Railway (API) + Vercel (UI) |

### Why this stack?

- **.NET Web API**: strong typing, built-in dependency injection, and clean
  separation between controllers, services, and repositories.
- **SQL Server + Stored Procedures**: business rules (status validation and
  mandatory reason when blocking) are enforced at the database level,
  guaranteeing data integrity regardless of the entry point.
- **React + Vite**: fast dev server with hot module replacement, simple
  component-based architecture, and easy deployment.
- **Dapper**: lightweight micro-ORM that keeps stored procedure calls clean
  and explicit.

---

## Project Structure

```
SupportPortal/
├── SupportPortal/                 # .NET 8 Web API (backend)
│   ├── Controllers/               # API endpoints (thin layer)
│   ├── Services/                  # Business logic
│   ├── Repositories/              # Data access (Dapper)
│   ├── Models/Dtos/               # Data Transfer Objects
│   ├── database/                  # schema.sql + stored-procedures.sql
│   ├── data structure/            # ERD + Data Dictionary
│   ├── Program.cs
│   └── appsettings.json
│
├── frontend/                      # React + Vite (frontend)
│   ├── src/
│   │   ├── components/            # Sidebar, Header, KpiCards, ClientGrid,
│   │   │                          # ClientDetailPanel, StatusModal, StatusChip
│   │   ├── services/api.js        # API client
│   │   ├── styles/theme.css       # Colors and typography
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── SupportPortal.slnx
└── .gitignore
```

---

## Data Model

The system uses three relational tables.

### Client

| Field           | Type         | Constraints           |
|-----------------|--------------|-----------------------|
| id              | INT          | PK, IDENTITY          |
| document_number | VARCHAR(20)  | UNIQUE, NOT NULL      |
| business_name   | VARCHAR(200) | NOT NULL              |
| created_at      | DATETIME     | DEFAULT GETDATE()     |

### Account

| Field          | Type         | Constraints                    |
|----------------|--------------|--------------------------------|
| id             | INT          | PK, IDENTITY                   |
| client_id      | INT          | FK → Client.id, NOT NULL       |
| account_number | VARCHAR(20)  | UNIQUE, NOT NULL               |
| status         | VARCHAR(20)  | NOT NULL, DEFAULT 'ACTIVE'     |
| status_reason  | VARCHAR(500) | NULL (mandatory when BLOCKED)  |
| updated_at     | DATETIME     | DEFAULT GETDATE()              |

### AccountDetail (audit trail)

| Field          | Type         | Constraints                    |
|----------------|--------------|--------------------------------|
| id             | INT          | PK, IDENTITY                   |
| account_id     | INT          | FK → Account.id, NOT NULL      |
| old_status     | VARCHAR(20)  | NULL                           |
| new_status     | VARCHAR(20)  | NOT NULL                       |
| status_reason  | VARCHAR(500) | NULL                           |
| changed_by     | VARCHAR(100) | NULL                           |
| changed_at     | DATETIME     | DEFAULT GETDATE()              |

### Relationships

- **Client (1) — (N) Account**: one client can own many accounts.
- **Account (1) — (N) AccountDetail**: one account has many status changes.

---

## Business Rules

1. An account can only have the status `ACTIVE` or `BLOCKED`.
2. When `status = BLOCKED`, the `status_reason` field is **mandatory**.
3. When `status = ACTIVE`, the `status_reason` is cleared (set to NULL).
4. Every status change is logged in `AccountDetail` for audit purposes.
5. The business rule is enforced at **three levels**:
   - **Frontend**: the modal disables "Save" until a reason is provided.
   - **Service layer**: throws `ArgumentException` if the rule is violated.
   - **Stored procedure**: uses `RAISERROR` as the last line of defense.

---

## API Endpoints

### Search clients

```
GET /api/clients?document={documentNumber}
```

- `document` supports partial match on **document number** or **business name**.
- Returns a flat list of clients joined with their accounts.
- Empty search returns all records.

**Example:**

```bash
curl "http://localhost:5043/api/clients?document=20"
```

### Update account status

```
PUT /api/accounts/{id}/status
Content-Type: application/json

{
  "status": "ACTIVE" | "BLOCKED",
  "reason": "Required when status is BLOCKED"
}
```

- Returns `200 OK` with `{ "message": "Account status updated successfully." }`.
- Returns `400 Bad Request` with `{ "error": "..." }` when:
  - The status value is invalid.
  - The status is `BLOCKED` and the reason is missing.
  - The account does not exist.

**Example:**

```bash
curl -X PUT "http://localhost:5043/api/accounts/2/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"BLOCKED","reason":"Suspicious operation reported"}'
```

### Get account status history

```
GET /api/accounts/{id}/history
```

- Returns the full status change history for a given account, ordered by
  most recent first.

---

## Sequence Flow

### 1. Search clients

1. The operator types in the search bar (client-side debounce: 300 ms).
2. The frontend calls `GET /api/clients?document=...`.
3. `ClientsController.Search` delegates to `ClientService.SearchClientsAsync`.
4. The repository executes `sp_search_clients` via Dapper.
5. Results are returned and grouped by client in the frontend.

### 2. Update account status

1. The operator selects an account and clicks "Cambiar estado".
2. The frontend opens `StatusModal`.
3. If the new status is `BLOCKED`, a reason is required before submitting.
4. The frontend sends `PUT /api/accounts/{id}/status`.
5. The controller delegates to `ClientService.UpdateAccountStatusAsync`.
6. The service validates business rules and calls the repository.
7. The repository executes `sp_update_account_status`, which:
   - Validates the status.
   - Requires a reason when blocking.
   - Updates the account and inserts a record in `AccountDetail`.
8. The frontend refreshes the grid.

---

## Running Locally

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org)
- SQL Server (local or Docker)

### 1. Clone the repository

```bash
git clone https://github.com/keylinPov29/SupportPortal.git
cd SupportPortal
```

### 2. Set up the database

Open SQL Server Management Studio and run, in order:

```
SupportPortal/database/schema.sql
SupportPortal/database/stored-procedures.sql
```

### 3. Configure the backend connection string

Edit `SupportPortal/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SupportPortalDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
  }
}
```

> Never commit real credentials. Use environment variables in production.

### 4. Run the backend

```bash
cd SupportPortal
dotnet restore
dotnet run
```

The API will be available at `http://localhost:5043` (check the console output
for the exact port). Swagger UI is available at `/swagger`.

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in `frontend/`:

```
VITE_API_URL=http://localhost:5043
```

The frontend will be available at `http://localhost:5173`.

---

## Deployment

- **Backend API**: (pending deployment — Railway)
- **Frontend**: (pending deployment — Vercel)

### Local development URLs

- **API (local)**: http://localhost:5043/swagger
- **Frontend (local)**: http://localhost:5173

Environment variables are configured in the hosting dashboard —
no secrets are committed to the repository.

---

## Design Decisions

- **Thin controllers**: only handle HTTP concerns; business logic lives in
  the service layer.
- **Repository pattern**: isolates data access and stored procedure calls.
- **Stored procedures**: used for search, update, and history queries,
  as required by the challenge (R1.6).
- **DTOs**: separate API contracts from database entities.
- **Dapper**: minimal overhead and full control over SQL.
- **Audit trail**: every status change is recorded in `AccountDetail`.
- **English First**: code, commits, and documentation are in English.

---

## Future Improvements

- Pagination on the client grid.
- Filter chips (All / Active / Blocked).
- Status change history visible in the UI (modal).
- Authentication and role-based authorization.
- Global exception middleware.

---

## Author

**Keylin Poves**
Cohort 2026 — DTP-L1-2026
