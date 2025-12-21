import { Request, Response } from 'express';
import config from '@/app/config'; // call before other app imports
import pool from '@/app/store';
import { Category, NewCategory } from '@/app/models/category';

////////////////////////////////////////////////////////////////////////////////////////////////////

// create category
export async function createCategory(req: Request, res: Response) {
  const { category }: NewCategory = req.body;
  const errors: { msg: string }[] = [];

  if (
    typeof category !== 'string' ||
    category.trim().length === 0 ||
    category.trim().length > 255
  ) {
    errors.push({ msg: 'Category must be a non-empty string with a max of 255 characters' });
  }

  if (errors.length > 0) return res.status(400).json({ errors });
  const name = (category as string).trim();

  try {
    const [result] = await pool.query(
      'INSERT INTO categories (category) VALUES (?)',
      [name]
    );

    res.status(201).json({ id: (result as any).insertId });
  } catch (error: any) {
    // handle duplicate entry gracefully
    if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1_062) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// delete task
export async function deleteCategory(req: Request, res: Response) {
  const id = parseInt(req.params?.id, 10) || 0; // do not use nullish coalescing here

  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0)
      return res.status(404).json({ error: 'Category not found' });

    res.json({ message: 'Category deleted' });
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// get category by ID
export async function getCategory(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10) || 0;

  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    const categories = rows as Category[];

    if (categories.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(categories[0]);
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// get all categories
export async function getCategories(req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY category ASC');
    const categories = rows as Category[];

    if (categories.length === 0) return res.status(404).json({ error: 'No categories are found' });
    res.json(categories);
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
