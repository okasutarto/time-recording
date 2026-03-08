import { runQuery, getOne, getAll, insertAndGetId, runAndGetChanges, atomicClockIn, transaction } from '../db/database';
import { TimeRecord, CreateTimeRecordInput, UpdateTimeRecordInput, ClockStatus } from '../types';

export class TimeRecordService {
  static clockIn(userId: number): TimeRecord {
    const now = new Date().toISOString();

    // Use atomic clock-in to prevent race conditions
    const result = atomicClockIn(userId, now);

    if (!result.success) {
      throw new Error(result.error || 'ALREADY_CLOCKED_IN');
    }

    return this.getRecordById(userId, result.id!)!;
  }

  static clockOut(userId: number): TimeRecord {
    // Use transaction for atomic operation
    return transaction(() => {
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
    });
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

  /**
   * Check if a time range overlaps with any existing records for a user.
   * Returns the overlapping record if found, otherwise null.
   */
  static checkOverlap(userId: number, clockIn: string, clockOut: string | null, excludeRecordId?: number): TimeRecord | null {
    // If no clock_out, it's an active record - check for any overlap with open-ended ranges
    // For active records, check if the clock_in is within any existing record's range
    const existingRecords = getAll(
      `SELECT * FROM time_records
       WHERE user_id = ?
         AND id != ?
         AND (
           -- New record is within an existing record's range
           (clock_in <= ? AND (clock_out IS NULL OR clock_out > ?))
           OR
           -- New record encompasses an existing record
           (clock_in >= ? AND (clock_out IS NULL OR clock_out <= ?))
           OR
           -- New record starts before and ends after an existing record
           (clock_in < ? AND (clock_out IS NULL OR clock_out > ?))
         )`,
      [
        userId,
        excludeRecordId || 0,
        clockIn, clockIn,  // new.clock_in <= existing.clock_in AND new.clock_in < existing.clock_out
        clockIn, clockOut || clockIn,  // new.clock_in >= existing.clock_in AND new.clock_out <= existing.clock_out
        clockIn, clockIn  // new.clock_in < existing.clock_in AND new.clock_out > existing.clock_in
      ]
    );

    return existingRecords.length > 0 ? existingRecords[0] : null;
  }

  static createRecord(input: CreateTimeRecordInput): TimeRecord {
    // Validate that clock_out is after clock_in if provided
    if (input.clock_out && new Date(input.clock_out) <= new Date(input.clock_in)) {
      throw new Error('INVALID_TIME_RANGE');
    }

    // Check for overlapping records
    const overlap = this.checkOverlap(input.user_id, input.clock_in, input.clock_out || null);
    if (overlap) {
      throw new Error('OVERLAP_DETECTED');
    }

    const id = insertAndGetId(
      'INSERT INTO time_records (user_id, clock_in, clock_out) VALUES (?, ?, ?)',
      [input.user_id, input.clock_in, input.clock_out || null]
    );

    return this.getRecordById(input.user_id, id)!;
  }

  static getRecordsByUserId(userId: number, limit?: number, offset?: number): TimeRecord[] {
    let sql = 'SELECT * FROM time_records WHERE user_id = ? ORDER BY clock_in DESC';
    const params: (number | string)[] = [userId];

    if (limit !== undefined) {
      sql += ' LIMIT ?';
      params.push(limit);
    }

    if (offset !== undefined) {
      sql += ' OFFSET ?';
      params.push(offset);
    }

    return getAll(sql, params);
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

    // Check for overlapping records (excluding current record)
    const overlap = this.checkOverlap(userId, clockIn, clockOut, recordId);
    if (overlap) {
      throw new Error('OVERLAP_DETECTED');
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
