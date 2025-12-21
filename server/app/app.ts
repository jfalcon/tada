import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { registerRoutes } from '@/app/routes';

const app = express();

// first add extra middleware
app.use(express.json()); // replaces body-parser
app.use(express.urlencoded({ extended: true }));

// enforce HTTPS
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  next();
});

// the last middleware should be the error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // this should be logged to a file or monitoring service in production
  console.error(err.stack);

  // never return stack traces in production
  res.status(500).json({ error: 'Internal Server Error' });
});

// then register all routes
registerRoutes(app);

export default app;
