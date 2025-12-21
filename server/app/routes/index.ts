import { Application } from 'express';
import categoryRoutes from './category';
import homeRoutes from './home';
import userRoutes from './user';
import taskRoutes from './task';
import weatherRoutes from './weather';

// showing an index example without barrel imports
export function registerRoutes(app: Application): void {
  app.use('/', homeRoutes);

  app.use('/category', categoryRoutes);
  app.use('/user', userRoutes);
  app.use('/task', taskRoutes);
  app.use('/weather', weatherRoutes);

  // aliases
  app.use('/c', categoryRoutes);
  app.use('/u', userRoutes);
  app.use('/t', taskRoutes);
  app.use('/w', weatherRoutes);
}
