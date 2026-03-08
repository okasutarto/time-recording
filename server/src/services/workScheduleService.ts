import { runQuery, getOne, getAll, runAndGetChanges } from '../db/database';
import { WorkSchedule, WorkConfig, WorkScheduleInput, UpdateWorkConfigInput } from '../types';

export class WorkConfigService {
  static getConfig(): WorkConfig {
    return getOne('SELECT * FROM work_config WHERE id = 1');
  }

  static updateConfig(input: UpdateWorkConfigInput): WorkConfig {
    const existing = this.getConfig();

    const normal_hours_per_day = input.normal_hours_per_day ?? existing.normal_hours_per_day;
    const normal_hours_per_week = input.normal_hours_per_week ?? existing.normal_hours_per_week;

    runQuery(
      'UPDATE work_config SET normal_hours_per_day = ?, normal_hours_per_week = ? WHERE id = 1',
      [normal_hours_per_day, normal_hours_per_week]
    );

    return this.getConfig();
  }
}

export class WorkScheduleService {
  static getUserSchedule(userId: number): WorkSchedule[] {
    return getAll(
      'SELECT * FROM work_schedules WHERE user_id = ? ORDER BY day_of_week',
      [userId]
    );
  }

  static setUserSchedule(userId: number, schedule: WorkScheduleInput[]): WorkSchedule[] {
    // Delete existing schedule
    runQuery('DELETE FROM work_schedules WHERE user_id = ?', [userId]);

    // Insert new schedule
    for (const day of schedule) {
      runQuery(
        'INSERT INTO work_schedules (user_id, day_of_week, is_working_day) VALUES (?, ?, ?)',
        [userId, day.day_of_week, day.is_working_day ? 1 : 0]
      );
    }

    return this.getUserSchedule(userId);
  }

  static isWorkingDay(userId: number, date: Date): boolean {
    const dayOfWeek = date.getDay();

    // Check user-specific schedule first
    const userSchedule = getOne(
      'SELECT is_working_day FROM work_schedules WHERE user_id = ? AND day_of_week = ?',
      [userId, dayOfWeek]
    );

    if (userSchedule) {
      return userSchedule.is_working_day === 1;
    }

    // Default: Monday-Friday are working days (1-5)
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  static getDefaultSchedule(): WorkScheduleInput[] {
    return [
      { day_of_week: 0, is_working_day: false }, // Sunday
      { day_of_week: 1, is_working_day: true },  // Monday
      { day_of_week: 2, is_working_day: true },  // Tuesday
      { day_of_week: 3, is_working_day: true },  // Wednesday
      { day_of_week: 4, is_working_day: true },  // Thursday
      { day_of_week: 5, is_working_day: true },  // Friday
      { day_of_week: 6, is_working_day: false }, // Saturday
    ];
  }
}
