import { runQuery, getOne, getAll, insertAndGetId, runAndGetChanges } from '../db/database';
import { User, CreateUserInput, UpdateUserInput } from '../types';

export class UserService {
  static createUser(input: CreateUserInput): User {
    const id = insertAndGetId(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [input.name, input.email]
    );
    return this.getUserById(id)!;
  }

  static getAllUsers(): User[] {
    return getAll('SELECT * FROM users ORDER BY id');
  }

  static getUserById(id: number): User | undefined {
    return getOne('SELECT * FROM users WHERE id = ?', [id]);
  }

  static updateUser(id: number, input: UpdateUserInput): User | undefined {
    const existing = this.getUserById(id);
    if (!existing) return undefined;

    const name = input.name ?? existing.name;
    const email = input.email ?? existing.email;

    runQuery('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    return this.getUserById(id);
  }

  static deleteUser(id: number): boolean {
    const changes = runAndGetChanges('DELETE FROM users WHERE id = ?', [id]);
    return changes > 0;
  }

  static getUserByEmail(email: string): User | undefined {
    return getOne('SELECT * FROM users WHERE email = ?', [email]);
  }
}
