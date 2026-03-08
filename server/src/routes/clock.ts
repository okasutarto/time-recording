import { Router, Request, Response } from 'express';
import { TimeRecordService } from '../services/timeRecordService';
import { UserService } from '../services/userService';

const router = Router();

// Clock in
router.post('/in/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    const user = UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const record = TimeRecordService.clockIn(userId);
    res.status(201).json(record);
  } catch (error: any) {
    if (error.message === 'ALREADY_CLOCKED_IN') {
      return res.status(409).json({ error: 'User is already clocked in' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clock out
router.post('/out/:userId', (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    const user = UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const record = TimeRecordService.clockOut(userId);
    res.json(record);
  } catch (error: any) {
    if (error.message === 'NOT_CLOCKED_IN') {
      return res.status(409).json({ error: 'User is not clocked in' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get clock status
router.get('/status/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  const user = UserService.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const status = TimeRecordService.getClockStatus(userId);
  res.json(status);
});

export default router;
