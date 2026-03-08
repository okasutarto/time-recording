import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserInput, UpdateUserInput } from '../types';

const router = Router();

// Create user
router.post('/', (req: Request, res: Response) => {
  try {
    const input = req.body as CreateUserInput;
    if (!input.name || input.name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (input.name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must be 100 characters or less' });
    }

    const user = UserService.createUser({ name: input.name.trim() });
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/', (_req: Request, res: Response) => {
  try {
    const users = UserService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const input = req.body as UpdateUserInput;

    if (input.name !== undefined && input.name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must be 100 characters or less' });
    }

    const user = UserService.updateUser(id, input);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const deleted = UserService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
