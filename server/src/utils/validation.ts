/**
 * Input validation utilities for the Time Recording System.
 * Validates user input at the system boundary before processing.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate user name
 * Requirements: required, min 1 char, max 100 chars
 */
export function validateUserName(name: string | undefined): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length > 100) {
    errors.push('Name must be 100 characters or less');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate time record input
 * Requirements:
 * - user_id is required and must be a positive integer
 * - clock_in is required and must be a valid date
 * - clock_out (if provided) must be a valid date after clock_in
 * - No future timestamps for clock_in
 */
export function validateTimeRecordInput(input: {
  user_id?: number;
  clock_in?: string;
  clock_out?: string | null;
}): ValidationResult {
  const errors: string[] = [];

  // Validate user_id
  if (input.user_id === undefined || input.user_id === null) {
    errors.push('user_id is required');
  } else if (!Number.isInteger(input.user_id) || input.user_id <= 0) {
    errors.push('user_id must be a positive integer');
  }

  // Validate clock_in
  if (!input.clock_in) {
    errors.push('clock_in is required');
  } else {
    const clockInDate = new Date(input.clock_in);
    if (isNaN(clockInDate.getTime())) {
      errors.push('clock_in must be a valid date');
    } else if (clockInDate > new Date()) {
      errors.push('clock_in cannot be in the future');
    }
  }

  // Validate clock_out if provided
  if (input.clock_out) {
    const clockOutDate = new Date(input.clock_out);
    if (isNaN(clockOutDate.getTime())) {
      errors.push('clock_out must be a valid date');
    } else if (input.clock_in) {
      const clockInDate = new Date(input.clock_in);
      if (clockOutDate <= clockInDate) {
        errors.push('clock_out must be after clock_in');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate schedule input
 * Requirements:
 * - day_of_week must be 0-6 (Sunday-Saturday)
 * - is_working_day must be 0 or 1
 */
export function validateScheduleInput(input: {
  day_of_week?: number;
  is_working_day?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (input.day_of_week === undefined || input.day_of_week === null) {
    errors.push('day_of_week is required');
  } else if (!Number.isInteger(input.day_of_week) || input.day_of_week < 0 || input.day_of_week > 6) {
    errors.push('day_of_week must be between 0 (Sunday) and 6 (Saturday)');
  }

  if (input.is_working_day === undefined || input.is_working_day === null) {
    errors.push('is_working_day is required');
  } else if (![0, 1].includes(input.is_working_day)) {
    errors.push('is_working_day must be 0 or 1');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate date range for reports
 */
export function validateDateRange(startDate?: string, endDate?: string): ValidationResult {
  const errors: string[] = [];

  if (!startDate) {
    errors.push('startDate is required');
  } else {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('startDate must be a valid date');
    }
  }

  if (!endDate) {
    errors.push('endDate is required');
  } else {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('endDate must be a valid date');
    }
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      errors.push('startDate must be before or equal to endDate');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit?: number, offset?: number): ValidationResult {
  const errors: string[] = [];

  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1) {
      errors.push('limit must be a positive integer');
    } else if (limit > 100) {
      errors.push('limit must be 100 or less');
    }
  }

  if (offset !== undefined) {
    if (!Number.isInteger(offset) || offset < 0) {
      errors.push('offset must be a non-negative integer');
    }
  }

  return { valid: errors.length === 0, errors };
}
