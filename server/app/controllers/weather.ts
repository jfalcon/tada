import { Request, Response } from 'express';
import config from '@/app/config'; // call before other app imports
import { weather } from '@/app/services/weather';

// default to Linn, Kansas because why not
const DEF_LAT = 39.7456;
const DEF_LONG = -97.0892;

////////////////////////////////////////////////////////////////////////////////////////////////////

export async function getWeather(req: Request, res: Response) {
  const lat = parseFloat(req.params.lat) || DEF_LAT; // do not use nullish coalescing here
  const long = parseFloat(req.params.long) || DEF_LONG; // do not use nullish coalescing here

  try {
    const employee = await weather(lat, long);

    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Weather not found.' });
    }
  } catch (error) {
    // eventually log the error for non-development environments
    res.status(500).json({ error: config.isDev ? error : 'Server error' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
