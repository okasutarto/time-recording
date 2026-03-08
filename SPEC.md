# Time Recording System - Specification

## Project Overview
- **Project Name**: Time Recording System
- **Type**: REST API Backend Service
- **Core Functionality**: Clock-in/clock-out time tracking with work calendar rules, CRUD operations, and reporting
- **Target Users**: Employees tracking work hours and managers reviewing time reports

## Technical Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3 (synchronous, thread-safe)
- **Language**: TypeScript

## Database Schema

### Tables

#### users
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| name | TEXT NOT NULL | User's full name |
| email | TEXT UNIQUE NOT NULL | User's email |
| created_at | DATETIME | Creation timestamp |

#### work_schedules
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| user_id | INTEGER NOT NULL | FK to users |
| day_of_week | INTEGER NOT NULL | 0=Sunday, 6=Saturday |
| is_working_day | BOOLEAN NOT NULL | Whether this day is a working day |
| created_at | DATETIME | Creation timestamp |

#### work_config
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Always 1 (singleton) |
| normal_hours_per_day | REAL NOT NULL | Default 8.0 hours |
| normal_hours_per_week | REAL NOT NULL | Default 40.0 hours |

#### time_records
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| user_id | INTEGER NOT NULL | FK to users |
| clock_in | DATETIME NOT NULL | Clock-in timestamp |
| clock_out | DATETIME NULL | Clock-out timestamp (NULL if active) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

## Functionality Specification

### 1. Clock Events

#### Clock In
- User can clock in if not currently clocked-in
- Creates a new time_record with clock_in = now, clock_out = NULL
- Returns the new record

#### Clock Out
- User can clock out only if currently clocked-in (clock_out is NULL)
- Updates the existing record with clock_out = now
- Returns the updated record

#### Validation Rules
- Cannot clock-in when already clocked-in (active record exists)
- Cannot clock-out when not clocked-in (no active record)
- Clock-out time must be after clock-in time

### 2. Work Calendar & Rules

#### Working Days Configuration
- Default: Monday-Friday are working days (0=Sunday to 6=Saturday)
- Saturday and Sunday are non-working days by default
- Configurable per user via work_schedules table

#### Working Hours
- Normal hours per day: 8 hours (configurable)
- Normal hours per week: 40 hours (configurable)

#### Overtime Calculation
- Daily overtime = max(0, worked_hours - normal_hours_per_day)
- Weekly overtime = max(0, total_weekly_hours - normal_hours_per_week)

### 3. CRUD Operations

#### Time Records
- **Create**: Manual creation of time record (with clock_in, optional clock_out)
- **Read**: Get all records for user, get single record by ID
- **Update**: Modify clock_in or clock_out times
- **Delete**: Remove a time record (soft or hard delete)

#### Users
- Create, read, update, delete users

### 4. Reporting

#### Report Parameters
- user_id: Required
- start_date: Required (YYYY-MM-DD)
- end_date: Required (YYYY-MM-DD)

#### Report Output
- Daily breakdown with:
  - Date
  - Clock-in time
  - Clock-out time
  - Worked hours
  - Overtime hours
- Summary:
  - Total worked hours
  - Total overtime hours
  - Number of working days
  - Number of days worked

### 5. Resource Contention

#### Concurrency Handling
- Use database transactions with proper locking
- Use INSERT ... ON CONFLICT or check-then-act patterns
- Use SERIALIZABLE isolation level or equivalent locking
- Handle race conditions gracefully with appropriate error messages

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Clock Events
- `POST /api/clock/in/:userId` - Clock in
- `POST /api/clock/out/:userId` - Clock out
- `GET /api/clock/status/:userId` - Get current clock status

### Time Records
- `POST /api/records` - Create record
- `GET /api/records/:userId` - Get all records for user
- `GET /api/records/:userId/:id` - Get single record
- `PUT /api/records/:userId/:id` - Update record
- `DELETE /api/records/:userId/:id` - Delete record

### Reports
- `GET /api/reports/:userId?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Generate report

### Configuration
- `GET /api/config` - Get work configuration
- `PUT /api/config` - Update work configuration
- `GET /api/schedule/:userId` - Get user's work schedule
- `PUT /api/schedule/:userId` - Update user's work schedule

## Assumptions

1. **Single application instance**: While the system handles concurrent requests, it's designed for a single application instance
2. **User authentication**: Not implemented - user_id is passed directly in URLs (simplified for this exercise)
3. **Timezone**: All times are stored and returned in UTC
4. **Date range**: Start and end dates are inclusive
5. **Overnight work**: Not supported - assumed work happens within a single day
6. **No holidays**: Only weekends are considered non-working days (can be extended)

## Acceptance Criteria

1. User can clock in and out successfully
2. Invalid transitions are prevented with appropriate error messages
3. Overtime is calculated correctly based on configured normal hours
4. Reports show accurate daily and aggregate totals
5. Concurrent clock-in/out requests are handled correctly without data corruption
6. CRUD operations work as expected
7. All API endpoints return appropriate status codes and JSON responses
