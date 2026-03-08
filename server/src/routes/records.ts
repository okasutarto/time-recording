import { Router, Request, Response } from 'express';
import { TimeRecordService } from '../services/timeRecordService';
import { UserService } from '../services/userService';
import { CreateTimeRecordInput, UpdateTimeRecordInput } from '../types';

const router = Router();

// Create record
router.post('/', (req: Request, res: Response) => {
  try {
    const input = req.body as CreateTimeRecordInput;

    if (!input.user_id || !input.clock_in) {
      return res.status(400).json({ error: 'user_id and clock_in are required' });
    }

    const user = UserService.getUserById(input.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const record = TimeRecordService.createRecord(input);
    res.status(201).json(record);
  } catch (error: any) {
    if (error.message === 'INVALID_TIME_RANGE') {
      return res.status(400).json({ error: 'clock_out must be after clock_in' });
    }
    if (error.message === 'OVERLAP_DETECTED') {
      return res.status(400).json({ error: 'Time record overlaps with an existing record' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all records for user (with pagination)
router.get('/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

  const user = UserService.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const records = TimeRecordService.getRecordsByUserId(userId, limit, offset);
  res.json(records);
});

// Get single record
router.get('/:userId/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const id = parseInt(req.params.id);

  const record = TimeRecordService.getRecordById(userId, id);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }

  res.json(record);
});

// Update record
router.put('/:userId/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const id = parseInt(req.params.id);
  const input = req.body as UpdateTimeRecordInput;

  try {
    const record = TimeRecordService.updateRecord(userId, id, input);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error: any) {
    if (error.message === 'INVALID_TIME_RANGE') {
      return res.status(400).json({ error: 'clock_out must be after clock_in' });
    }
    if (error.message === 'OVERLAP_DETECTED') {
      return res.status(400).json({ error: 'Time record overlaps with an existing record' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete record
router.delete('/:userId/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const id = parseInt(req.params.id);

  const deleted = TimeRecordService.deleteRecord(userId, id);
  if (!deleted) {
    return res.status(404).json({ error: 'Record not found' });
  }

  res.status(204).send();
});

export default router;
