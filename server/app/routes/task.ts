import { Router } from 'express';
import { createTask, deleteTask, getTask, getTasks, updateTask } from '@/app/controllers/task';

const router = Router();

// showing an example without barrel imports (see controllers/index.ts)
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
