import { getAll } from '../db/database';
import { Report, DailyReport, TimeRecord } from '../types';
import { WorkConfigService, WorkScheduleService } from './workScheduleService';
import { UserService } from './userService';

export class ReportService {
  static generateReport(userId: number, startDate: string, endDate: string): Report {
    const user = UserService.getUserById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const config = WorkConfigService.getConfig();

    // Standardize input dates correctly so SQLite query evaluation doesn't silently resolve NULL
    const start = new Date(startDate);
    const end = new Date(endDate);
    const sqlStart = start.toISOString().split('T')[0];
    const sqlEnd = end.toISOString().split('T')[0];

    // Group records by day natively utilizing SQLite optimization
    const dailyStatsData = getAll(`
      SELECT 
        date(clock_in) as day_date,
        MIN(clock_in) as clock_in,
        MAX(clock_out) as clock_out,
        SUM((julianday(clock_out) - julianday(clock_in)) * 24) as total_hours
      FROM time_records
      WHERE user_id = ?
        AND date(clock_in) >= ?
        AND date(clock_in) <= ?
      GROUP BY date(clock_in)
    `, [userId, sqlStart, sqlEnd]);

    // Fast O(1) loop lookups
    const dailyStatsMap = new Map();
    for (const stat of dailyStatsData) {
      dailyStatsMap.set(stat.day_date, stat);
    }

    // Generate daily breakdown
    const dailyBreakdown: DailyReport[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWorkingDay = WorkScheduleService.isWorkingDay(userId, d);

      const stats = dailyStatsMap.get(dateStr);

      let totalHours = 0;
      let clockIn: string | null = null;
      let clockOut: string | null = null;

      if (stats) {
        clockIn = stats.clock_in;
        clockOut = stats.clock_out;
        totalHours = stats.total_hours || 0;
      }

      const overtimeHours = isWorkingDay ? Math.max(0, totalHours - config.normal_hours_per_day) : 0;

      dailyBreakdown.push({
        date: dateStr,
        clock_in: clockIn,
        clock_out: clockOut,
        worked_hours: Math.round(totalHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        is_working_day: isWorkingDay
      });
    }

    // Calculate summary
    const totalWorkedHours = dailyBreakdown.reduce((sum, d) => sum + d.worked_hours, 0);
    const totalOvertimeHours = dailyBreakdown.reduce((sum, d) => sum + d.overtime_hours, 0);
    const numberOfWorkingDays = dailyBreakdown.filter(d => d.is_working_day).length;
    const numberOfDaysWorked = dailyBreakdown.filter(d => d.clock_in !== null).length;

    return {
      user_id: userId,
      user_name: user.name,
      start_date: startDate,
      end_date: endDate,
      daily_breakdown: dailyBreakdown,
      summary: {
        total_worked_hours: Math.round(totalWorkedHours * 100) / 100,
        total_overtime_hours: Math.round(totalOvertimeHours * 100) / 100,
        number_of_working_days: numberOfWorkingDays,
        number_of_days_worked: numberOfDaysWorked
      }
    };
  }
}
