export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface WorkSchedule {
  id: number;
  user_id: number;
  day_of_week: number;
  is_working_day: boolean;
  created_at: string;
}

export interface WorkConfig {
  id: number;
  normal_hours_per_day: number;
  normal_hours_per_week: number;
}

export interface TimeRecord {
  id: number;
  user_id: number;
  clock_in: string;
  clock_out: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyReport {
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  worked_hours: number;
  overtime_hours: number;
  is_working_day: boolean;
}

export interface Report {
  user_id: number;
  user_name: string;
  start_date: string;
  end_date: string;
  daily_breakdown: DailyReport[];
  summary: {
    total_worked_hours: number;
    total_overtime_hours: number;
    number_of_working_days: number;
    number_of_days_worked: number;
  };
}

export interface CreateUserInput {
  name: string;
}

export interface UpdateUserInput {
  name?: string;
}

export interface CreateTimeRecordInput {
  user_id: number;
  clock_in: string;
  clock_out?: string;
}

export interface UpdateTimeRecordInput {
  clock_in?: string;
  clock_out?: string | null;
}

export interface UpdateWorkConfigInput {
  normal_hours_per_day?: number;
  normal_hours_per_week?: number;
}

export interface WorkScheduleInput {
  day_of_week: number;
  is_working_day: boolean;
}

export interface ClockStatus {
  is_clocked_in: boolean;
  current_record: TimeRecord | null;
}
