import dotenv from 'dotenv';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export interface Config {
  env: Environment;
  isDev: boolean;
  port: number;
}

/**
 * Configuration object.
*/
const config: Config = {
  env: Environment[(process.env.NODE_ENV || 'development') as keyof typeof Environment],
  isDev: false,
  port: parseInt(process.env.SERVER_PORT ?? '4000', 10) || 4_000,
};

// load environment variables only in development mode
config.isDev = config.env !== 'production';
if (config.isDev) dotenv.config();

export default config;
