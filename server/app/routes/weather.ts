import { Router } from 'express';
import * as controllers from '@/app/controllers';

const router = Router();

// showing an example with barrel imports (see controllers/index.ts)
router.get('/', controllers.weather.getWeather);
router.get('/:lat/:long', controllers.weather.getWeather);

export default router;
