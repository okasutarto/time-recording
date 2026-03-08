import { Router, Request, Response } from 'express';
import { WorkConfigService, WorkScheduleService } from '../services/workScheduleService';
import { UserService } from '../services/userService';
import { UpdateWorkConfigInput, WorkScheduleInput } from '../types';

const router = Router();

// Get work config
router.get('/', (_req: Request, res: Response) => {
  try {
    const config = WorkConfigService.getConfig();
    res.json(config);
  } catch (error: any) {
    console.error('Error fetching work config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update work config
router.put('/', (req: Request, res: Response) => {
  try {
    const input = req.body as UpdateWorkConfigInput;

    if (input.normal_hours_per_day !== undefined && input.normal_hours_per_day < 0) {
      return res.status(400).json({ error: 'normal_hours_per_day must be non-negative' });
    }

    if (input.normal_hours_per_week !== undefined && input.normal_hours_per_week < 0) {
      return res.status(400).json({ error: 'normal_hours_per_week must be non-negative' });
    }

    const config = WorkConfigService.updateConfig(input);
    res.json(config);
  } catch (error: any) {
    console.error('Error updating work config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user schedule
router.get('/schedule/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const schedule = WorkScheduleService.getUserSchedule(userId);

    // If no custom schedule, return default
    if (schedule.length === 0) {
      return res.json(WorkScheduleService.getDefaultSchedule());
    }

    res.json(schedule.map(s => ({
      day_of_week: s.day_of_week,
      is_working_day: !!s.is_working_day
    })));
  } catch (error: any) {
    console.error('Error fetching user schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user schedule
router.put('/schedule/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const schedule = req.body as WorkScheduleInput[];

    const user = UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate schedule
    if (!Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ error: 'Schedule must be a non-empty array' });
    }

    for (const day of schedule) {
      if (day.day_of_week === undefined || day.is_working_day === undefined) {
        return res.status(400).json({ error: 'Each schedule entry must have day_of_week and is_working_day' });
      }
      if (day.day_of_week < 0 || day.day_of_week > 6) {
        return res.status(400).json({ error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' });
      }
    }

    const updatedSchedule = WorkScheduleService.setUserSchedule(userId, schedule);
    res.json(updatedSchedule.map(s => ({
      day_of_week: s.day_of_week,
      is_working_day: !!s.is_working_day
    })));
  } catch (error: any) {
    console.error('Error updating user schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
