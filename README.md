# Time Recording System

A REST API backend service for employee time tracking with clock-in/clock-out functionality, work calendar rules, and reporting.

## Features

- **Clock Events**: Clock-in/clock-out with validation to prevent invalid transitions
- **Work Calendar**: Configurable working days and normal working hours
- **CRUD Operations**: Full create, read, update, delete for users and time records
- **Reporting**: Generate detailed reports with daily breakdowns and aggregate totals
- **Concurrency Handling**: Database-level locking to ensure data integrity under concurrent requests

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create a new user |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Clock Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clock/in/:userId` | Clock in |
| POST | `/api/clock/out/:userId` | Clock out |
| GET | `/api/clock/status/:userId` | Get current clock status |

### Time Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/records` | Create a time record |
| GET | `/api/records/:userId` | Get all records for user |
| GET | `/api/records/:userId/:id` | Get single record |
| PUT | `/api/records/:userId/:id` | Update record |
| DELETE | `/api/records/:userId/:id` | Delete record |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/:userId?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` | Generate report |

### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config` | Get work configuration |
| PUT | `/api/config` | Update work configuration |
| GET | `/api/config/schedule/:userId` | Get user's work schedule |
| PUT | `/api/config/schedule/:userId` | Update user's work schedule |

## Example API Usage

### 1. Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
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
- `email`: TEXT UNIQUE NOT NULL
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

## Assumptions

1. **Authentication**: Not implemented - user_id is passed directly in URLs (simplified for this exercise)
2. **Timezone**: All times are stored and returned in UTC
3. **Date Range**: Start and end dates are inclusive
4. **Overnight Work**: Not supported - work is assumed to happen within a single day
5. **Holidays**: Only weekends are considered non-working days by default
6. **Single Instance**: Designed for a single application instance (uses file-based SQLite)

## Concurrency Handling

The system handles concurrent requests using:
- Database-level locking with `FOR UPDATE` in SQLite
- Atomic transactions for operations that require multiple steps
- Proper error messages for conflicting operations (e.g., trying to clock in when already clocked in)
