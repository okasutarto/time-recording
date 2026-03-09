# Time Recording System - Specification

## Project Overview

- **Project Name**: Time Recording System
- **Type**: REST API Backend Service
- **Core Functionality**: Clock-in/clock-out time tracking with work calendar rules, CRUD operations, and reporting
- **Target Users**: Employees tracking work hours and managers reviewing time reports

## Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js, Angular
- **Database**: SQLite
- **Language**: TypeScript

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
