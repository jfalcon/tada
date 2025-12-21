import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories
} from '@/app/controllers/category';

const router = Router();

// showing an example without barrel imports (see controllers/index.ts)
router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', createCategory);
router.delete('/:id', deleteCategory);

export default router;
