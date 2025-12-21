import { Router } from 'express';
import * as controllers from '@/app/controllers';

const router = Router();

// showing an index example with barrel imports (see controllers/index.ts)
router.get('/', controllers.home.index);

export default router;
