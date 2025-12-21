import { Request, Response } from 'express';
import config from '@/app/config'; // call before other app imports
import pool from '@/app/store';
import { User, NewUser } from '@/app/models/user';

////////////////////////////////////////////////////////////////////////////////////////////////////

// create user
export async function createUser(req: Request, res: Response) {
  const { username, email, password }: NewUser = req.body;

  const errors: { msg: string }[] = [];

  if (typeof username !== 'string' || username.trim().length < 1 || username.trim().length > 255) {
    errors.push({ msg: 'Username must be a string between 1 and 255 characters' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    errors.push({ msg: 'Email must be a valid email address' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters long' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password]
    );

    res.status(201).json({ id: (result as any).insertId });
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// get user by ID
export async function getUser(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10) || 0;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    const users = rows as User[];

    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// get all users
export async function getUsers(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY username ASC');
    const users = rows as User[];

    if (users.length === 0) return res.status(404).json({ error: 'No users are found' });
    res.json(users);
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// delete user
export async function deleteUser(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10) || 0;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0)
      return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
