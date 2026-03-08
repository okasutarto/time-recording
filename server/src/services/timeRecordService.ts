import { runQuery, getOne, getAll, insertAndGetId, runAndGetChanges, getDatabase } from '../db/database';
import { TimeRecord, CreateTimeRecordInput, UpdateTimeRecordInput, ClockStatus } from '../types';

export class TimeRecordService {
  static clockIn(userId: number): TimeRecord {
    // Check if already clocked in
    const activeRecord = getOne(
      'SELECT id FROM time_records WHERE user_id = ? AND clock_out IS NULL',
      [userId]
    );
    if (activeRecord) {
      throw new Error('ALREADY_CLOCKED_IN');
    }

    const now = new Date().toISOString();
    const id = insertAndGetId(
      "INSERT INTO time_records (user_id, clock_in) VALUES (?, ?)",
      [userId, now]
    );

    return this.getRecordById(userId, id)!;
  }

  static clockOut(userId: number): TimeRecord {
    // Check if clocked in
    const activeRecord = getOne(
      'SELECT id FROM time_records WHERE user_id = ? AND clock_out IS NULL',
      [userId]
    );
    if (!activeRecord) {
      throw new Error('NOT_CLOCKED_IN');
    }

    const now = new Date().toISOString();
    runQuery(
      "UPDATE time_records SET clock_out = ?, updated_at = ? WHERE id = ?",
      [now, now, activeRecord.id]
    );

    return this.getRecordById(userId, activeRecord.id)!;
  }

  static getClockStatus(userId: number): ClockStatus {
    const activeRecord = getOne(
      'SELECT * FROM time_records WHERE user_id = ? AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1',
      [userId]
    );

    return {
      is_clocked_in: !!activeRecord,
      current_record: activeRecord || null
    };
  }

  static createRecord(input: CreateTimeRecordInput): TimeRecord {
    // Validate that clock_out is after clock_in if provided
    if (input.clock_out && new Date(input.clock_out) <= new Date(input.clock_in)) {
      throw new Error('INVALID_TIME_RANGE');
    }

    const id = insertAndGetId(
      'INSERT INTO time_records (user_id, clock_in, clock_out) VALUES (?, ?, ?)',
      [input.user_id, input.clock_in, input.clock_out || null]
    );

    return this.getRecordById(input.user_id, id)!;
  }

  static getRecordsByUserId(userId: number): TimeRecord[] {
    return getAll(
      'SELECT * FROM time_records WHERE user_id = ? ORDER BY clock_in DESC',
      [userId]
    );
  }

  static getRecordById(userId: number, recordId: number): TimeRecord | undefined {
    return getOne(
      'SELECT * FROM time_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );
  }

  static updateRecord(userId: number, recordId: number, input: UpdateTimeRecordInput): TimeRecord | undefined {
    const existing = this.getRecordById(userId, recordId);
    if (!existing) return undefined;

    // Validate time range if both times are being updated
    const clockIn = input.clock_in ?? existing.clock_in;
    const clockOut = input.clock_out ?? existing.clock_out;

    if (clockOut && new Date(clockOut) <= new Date(clockIn)) {
      throw new Error('INVALID_TIME_RANGE');
    }

    const now = new Date().toISOString();
    runQuery(
      "UPDATE time_records SET clock_in = ?, clock_out = ?, updated_at = ? WHERE id = ?",
      [clockIn, clockOut, now, recordId]
    );

    return this.getRecordById(userId, recordId);
  }

  static deleteRecord(userId: number, recordId: number): boolean {
    const changes = runAndGetChanges(
      'DELETE FROM time_records WHERE id = ? AND user_id = ?',
      [recordId, userId]
    );
    return changes > 0;
  }

  static getRecordsInRange(userId: number, startDate: string, endDate: string): TimeRecord[] {
    return getAll(
      `SELECT * FROM time_records
       WHERE user_id = ?
         AND date(clock_in) >= date(?)
         AND date(clock_in) <= date(?)
       ORDER BY clock_in`,
      [userId, startDate, endDate]
    );
  }
}
