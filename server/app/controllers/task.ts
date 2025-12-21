import { Request, Response } from 'express';
import config from '@/app/config'; // call before other app imports
import pool from '@/app/store';
import { Task, NewTask, UpdateTask } from '@/app//models/task';

// simple date regex for YYYY-MM-DD
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

////////////////////////////////////////////////////////////////////////////////////////////////////

// create task
export async function createTask(req: Request, res: Response) {
  const {
    user_id,
    category_id,
    title,
    description,
    due_date,
    priority,
    status
  }: NewTask = req.body;

  const errors: { msg: string }[] = [];

  if (!Number.isInteger(user_id) || user_id < 1) {
    errors.push({ msg: 'User ID must be a positive integer' });
  }

  if (!Number.isInteger(category_id) || category_id < 1) {
    errors.push({ msg: 'Category ID must be a positive integer' });
  }

  if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 255) {
    errors.push({ msg: 'Title must be a string between 1 and 255 characters' });
  }

  if (description !== undefined
    && typeof description !== 'string') {
    errors.push({ msg: 'Description must be a string' });
  }

  if (due_date !== undefined
    && (typeof due_date !== 'string'
      || !datePattern.test(due_date)
      || isNaN(Date.parse(due_date)))
  ) {
    errors.push({ msg: 'Due date must be a valid date in YYYY-MM-DD format' });
  }

  if (priority !== undefined
    && !['Low', 'Medium', 'High'].includes(priority)) {
    errors.push({ msg: 'Priority must be one of: Low, Medium, High' });
  }

  if (status !== undefined
    && !['Pending', 'In Progress', 'Completed'].includes(status)) {
    errors.push({ msg: 'Status must be one of: Pending, In Progress, Completed' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, category_id, title, description, due_date, priority, status) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        user_id,
        category_id,
        title,
        description ?? null,
        due_date ?? null,
        priority ?? 'Medium',
        status ?? 'Pending'
      ]
    );

    res.status(201).json({ id: (result as any).insertId });
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// delete task
export async function deleteTask(req: Request, res: Response) {
  const id = parseInt(req.params?.id, 10) || 0; // do not use nullish coalescing here

  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0)
      return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// get task by ID
export async function getTask(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10) || 0; // do not use nullish coalescing here

  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    const tasks = rows as Task[];

    if (tasks.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(tasks[0]);
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// get all tasks
export async function getTasks(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    const tasks = rows as Task[];

    res.json(tasks);
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// update task
export async function updateTask(req: Request, res: Response) {
  const updates: UpdateTask = req.body;

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No updates provided' });

  const errors: { msg: string }[] = [];
  const id = parseInt(req.params?.id, 10) || 0; // do not use nullish coalescing here

  if (
    updates.user_id !== undefined
    && (!Number.isInteger(updates.user_id) || updates.user_id < 1)
  ) {
    errors.push({ msg: 'User ID must be a positive integer' });
  }

  if (
    updates.category_id !== undefined
    && (!Number.isInteger(updates.category_id) || updates.category_id < 1)
  ) {
    errors.push({ msg: 'Category ID must be a positive integer' });
  }

  if (
    updates.title !== undefined
    && (typeof updates.title !== 'string'
      || updates.title.trim().length < 1
      || updates.title.trim().length > 255)
  ) {
    errors.push({ msg: 'Title must be a string between 1 and 255 characters' });
  }

  if (updates.description !== undefined
    && typeof updates.description !== 'string'
  ) {
    errors.push({ msg: 'Description must be a string' });
  }

  if (updates.due_date !== undefined
    && (typeof updates.due_date !== 'string'
      || !datePattern.test(updates.due_date)
      || isNaN(Date.parse(updates.due_date)))
    ) {
    errors.push({ msg: 'Due date must be a valid date in YYYY-MM-DD format' });
  }

  if (updates.priority !== undefined
    && !['Low', 'Medium', 'High'].includes(updates.priority)) {
    errors.push({ msg: 'Priority must be one of: Low, Medium, High' });
  }

  if (updates.status !== undefined
    && !['Pending', 'In Progress', 'Completed'].includes(updates.status)) {
    errors.push({ msg: 'Status must be one of: Pending, In Progress, Completed' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    let query = 'UPDATE tasks SET ';
    const values: any[] = [];

    if (updates.user_id !== undefined) {
      query += 'user_id = ?, ';
      values.push(updates.user_id);
    }

    if (updates.category_id !== undefined) {
      query += 'category_id = ?, ';
      values.push(updates.category_id);
    }

    if (updates.title) {
      query += 'title = ?, ';
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      query += 'description = ?, ';
      values.push(updates.description);
    }

    if (updates.due_date !== undefined) {
      query += 'due_date = ?, ';
      values.push(updates.due_date);
    }

    if (updates.priority) {
      query += 'priority = ?, ';
      values.push(updates.priority);
    }

    if (updates.status) {
      query += 'status = ?, ';
      values.push(updates.status);
    }

    query = query.slice(0, -2) + ' WHERE id = ?';
    values.push(id);

    const [result] = await pool.query(query, values);
    if ((result as any).affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task updated' });
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
