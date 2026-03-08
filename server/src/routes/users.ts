import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserInput, UpdateUserInput } from '../types';

const router = Router();

// Create user
router.post('/', (req: Request, res: Response) => {
  try {
    const input = req.body as CreateUserInput;
    if (!input.name || !input.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const user = UserService.createUser(input);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.message === 'UNIQUE constraint failed: users.email') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/', (_req: Request, res: Response) => {
  const users = UserService.getAllUsers();
  res.json(users);
});

// Get user by ID
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = UserService.getUserById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Update user
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const input = req.body as UpdateUserInput;

  const user = UserService.updateUser(id, input);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Delete user
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const deleted = UserService.deleteUser(id);

  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(204).send();
});

export default router;
