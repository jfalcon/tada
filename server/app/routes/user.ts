import { Router } from 'express';
import { createUser, deleteUser, getUser, getUsers } from '@/app/controllers/user';

const router = Router();

// showing an example without barrel imports (see controllers/index.ts)
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.delete('/:id', deleteUser);

export default router;
