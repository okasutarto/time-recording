import { Router, Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { UserService } from '../services/userService';

const router = Router();

router.get('/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { start_date, end_date } = req.query;

  const user = UserService.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'start_date and end_date query parameters are required' });
  }

  try {
    const report = ReportService.generateReport(userId, start_date as string, end_date as string);
    res.json(report);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
