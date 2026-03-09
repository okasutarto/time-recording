# Time Recording System

A full-stack time tracking application with clock-in/clock-out functionality, work calendar rules, and reporting. Features a Node.js/Express backend and Angular frontend.

## Features

- **Clock Events**: Clock-in/clock-out with validation to prevent invalid transitions
- **Work Calendar**: Configurable working days and normal working hours
- **CRUD Operations**: Full create, read, update, delete for users and time records
- **Reporting**: Generate detailed reports with daily breakdowns and aggregate totals
- **Concurrency Handling**: Database-level locking to ensure data integrity under concurrent requests

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js, SQLite (sql.js)
- **Frontend**: Angular 17, TailwindCSS
- **Database**: SQLite

## Prerequisites

- Node.js 18+ installed
- npm

## Setup

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Build the Project

```bash
# Build server
cd server && npm run build

# Build client
cd ../client && npm run build
```

### Run the Application

```bash
# Start server (runs on http://localhost:3000)
cd server && npm run dev

# In another terminal, start client (runs on http://localhost:4200)
cd client && npm start
```

Or use the convenience scripts from root:

```bash
npm run server   # Start only server
npm run client  # Start only client
npm start       # Start both server and client
```

## API Endpoints

### Users

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/api/users`     | Create a new user |
| GET    | `/api/users`     | List all users    |
| GET    | `/api/users/:id` | Get user by ID    |
| PUT    | `/api/users/:id` | Update user       |
| DELETE | `/api/users/:id` | Delete user       |

### Clock Events

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/clock/in/:userId`     | Clock in                 |
| POST   | `/api/clock/out/:userId`    | Clock out                |
| GET    | `/api/clock/status/:userId` | Get current clock status |

### Time Records

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| POST   | `/api/records`             | Create a time record     |
| GET    | `/api/records/:userId`     | Get all records for user |
| GET    | `/api/records/:userId/:id` | Get single record        |
| PUT    | `/api/records/:userId/:id` | Update record            |
| DELETE | `/api/records/:userId/:id` | Delete record            |

### Reports

| Method | Endpoint                                                         | Description     |
| ------ | ---------------------------------------------------------------- | --------------- |
| GET    | `/api/reports/:userId?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Generate report |

### Configuration

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/config`                  | Get work configuration      |
| PUT    | `/api/config`                  | Update work configuration   |
| GET    | `/api/config/schedule/:userId` | Get user's work schedule    |
| PUT    | `/api/config/schedule/:userId` | Update user's work schedule |

## Example API Usage

### 1. Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

Response:

```json
{
  "id": 1,
  "name": "John Doe",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### 2. Clock In

```bash
curl -X POST http://localhost:3000/api/clock/in/1
```

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "clock_in": "2024-01-15T09:00:00.000Z",
  "clock_out": null,
  "created_at": "2024-01-15T09:00:00.000Z",
  "updated_at": "2024-01-15T09:00:00.000Z"
}
```

### 3. Clock Out

```bash
curl -X POST http://localhost:3000/api/clock/out/1
```

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "clock_in": "2024-01-15T09:00:00.000Z",
  "clock_out": "2024-01-15T17:30:00.000Z",
  "created_at": "2024-01-15T09:00:00.000Z",
  "updated_at": "2024-01-15T17:30:00.000Z"
}
```

### 4. Get Clock Status

```bash
curl http://localhost:3000/api/clock/status/1
```

Response:

```json
{
  "is_clocked_in": false,
  "current_record": null
}
```

### 5. Generate Report

```bash
curl "http://localhost:3000/api/reports/1?start_date=2024-01-15&end_date=2024-01-19"
```

Response:

```json
{
  "user_id": 1,
  "user_name": "John Doe",
  "start_date": "2024-01-15",
  "end_date": "2024-01-19",
  "daily_breakdown": [
    {
      "date": "2024-01-15",
      "clock_in": "2024-01-15T09:00:00.000Z",
      "clock_out": "2024-01-15T17:30:00.000Z",
      "worked_hours": 8.5,
      "overtime_hours": 0.5,
      "is_working_day": true
    }
  ],
  "summary": {
    "total_worked_hours": 8.5,
    "total_overtime_hours": 0.5,
    "number_of_working_days": 1,
    "number_of_days_worked": 1
  }
}
```

### 6. Update Work Configuration

```bash
curl -X PUT http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{"normal_hours_per_day": 8.5, "normal_hours_per_week": 42.5}'
```

### 7. Update User Schedule

```bash
curl -X PUT http://localhost:3000/api/config/schedule/1 \
  -H "Content-Type: application/json" \
  -d '[
    {"day_of_week": 0, "is_working_day": false},
    {"day_of_week": 1, "is_working_day": true},
    {"day_of_week": 2, "is_working_day": true},
    {"day_of_week": 3, "is_working_day": true},
    {"day_of_week": 4, "is_working_day": true},
    {"day_of_week": 5, "is_working_day": true},
    {"day_of_week": 6, "is_working_day": false}
  ]'
```

## Database Schema

### users

- `id`: INTEGER PRIMARY KEY
- `name`: TEXT NOT NULL
- `created_at`: DATETIME

### time_records

- `id`: INTEGER PRIMARY KEY
- `user_id`: INTEGER (FK to users)
- `clock_in`: DATETIME NOT NULL
- `clock_out`: DATETIME (NULL if active)
- `created_at`: DATETIME
- `updated_at`: DATETIME

### work_schedules

- `id`: INTEGER PRIMARY KEY
- `user_id`: INTEGER (FK to users)
- `day_of_week`: INTEGER (0=Sunday, 6=Saturday)
- `is_working_day`: BOOLEAN

### work_config

- `id`: INTEGER (always 1)
- `normal_hours_per_day`: REAL (default 8.0)
- `normal_hours_per_week`: REAL (default 40.0)

### Indexes

The following indexes are created for performance:

- `idx_time_records_user_id` - Query records by user
- `idx_time_records_clock_in` - Query records by date
- `idx_time_records_user_clock` - Composite index for user+date queries
- `idx_work_schedules_user_id` - Query schedules by user

## Assumptions

1. **Timezone**: All times are stored and returned in UTC
2. **Date Range**: Start and end dates are inclusive
3. **Overnight Work**: Not supported - work is assumed to happen within a single day. Clock-in and clock-out must be on the same calendar day.
4. **Holidays**: Only weekends are considered non-working days by default
5. **Single Instance**: Designed for a single application instance (uses file-based SQLite)
6. **Clock State**: Each user can have at most one active (unclosed) time record at any time

## Error Handling

All API errors return consistent JSON format:

```json
{ "error": "ERROR_CODE" }
```

### Error Codes

| Code | Description | HTTP Status |
| ---- | ----------- | ----------- |
| `ALREADY_CLOCKED_IN` | User already has an active clock-in | 400 |
| `NOT_CLOCKED_IN` | No active clock-in found | 400 |
| `INVALID_TIME_RANGE` | clock_out is before or equal to clock_in | 400 |
| `OVERLAP_DETECTED` | New record overlaps with existing records | 400 |
| `USER_NOT_FOUND` | User does not exist | 404 |
| `RECORD_NOT_FOUND` | Time record does not exist | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `Too many requests, please try again later` | Rate limit exceeded | 429 |
| `Internal server error` | Internal server error | 500 |

### Global Error Handler

All unhandled errors return a generic 500 response to prevent leaking internal details.

## Validation

### Clock Operations

- **Clock In**: Prevents if user already has an active (unclosed) time record
- **Clock Out**: Requires an active clock-in record; validates clock_out > clock_in
- **Time Records**: Ensures clock_out is after clock_in

### Record Overlap Detection

The system detects and prevents overlapping time records:

- New record within existing record's range
- New record encompasses existing record
- New record overlaps with any part of existing record

### Data Constraints

- SQLite CHECK constraints enforce valid day_of_week (0-6) and is_working_day (0/1)
- Foreign key constraints with CASCADE delete for data integrity
- Database-level CHECK ensures clock_out > clock_in

## Edge Cases

1. **Overnight Work**: Not supported - clock-in and clock-out must be on the same calendar day
2. **Timezone**: All times stored in UTC
3. **Multiple Clock-ins**: Prevented via atomic clock-in with write locks
4. **Concurrent Clock-outs**: Prevented via atomic clock-out with write locks
5. **Concurrent Record Edits**: Not fully protected - overlap check + update is not atomic
6. **Empty Date Ranges**: Returns empty daily_breakdown array
7. **Non-working Days**: Reported but excluded from overtime calculations
8. **Partial Days**: Worked hours calculated correctly even if < normal hours

## Security

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable allowed origins (default: localhost:4200)
- **Request Size**: JSON body limited to 10kb
- **Input Sanitization**: Parameterized queries prevent SQL injection

## Data Persistence

- Database stored at: `server/data/timeRecording.db`
- Auto-saved after each write operation
- Graceful shutdown ensures data is persisted
- Supports hot restart without data loss

## Graceful Shutdown

The server handles SIGINT and SIGTERM signals to:
- Save database before exit
- Close database connections properly
- Prevent data corruption

## Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{ "status": "ok", "timestamp": "2024-01-15T10:30:00.000Z" }
```

## Concurrency Handling

The system handles concurrent requests using:

- **BEGIN IMMEDIATE**: SQLite transaction mode that acquires a write lock immediately
- **Atomic Operations**: Clock-in and clock-out use real SQLite transactions with locking
- **Single Active Record**: Database design ensures one active record per user at any time

### Race Condition Prevention

1. **Clock In**: Uses `BEGIN IMMEDIATE` + check-then-insert in single transaction (real transaction)
2. **Clock Out**: Uses `BEGIN IMMEDIATE` + check-then-update in single transaction (real transaction)
3. **Record Create/Update**: Not atomic - performs overlap check then insert/update separately (potential race condition for concurrent edits)

### Transaction Implementation Note

This project uses sql.js (SQLite in-memory). The `transaction()` function in the codebase is NOT a real database transaction - it merely executes code and saves the database afterward. Only functions explicitly marked as `atomic*` (e.g., `atomicClockIn`, `atomicClockOut`) use real SQLite transactions with `BEGIN IMMEDIATE`.
