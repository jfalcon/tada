import path from 'node:path';
import fs from 'node:fs';
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import config from '@/app/config'; // call before other app imports
import app from "@/app/app";

export const server = async () => {
  if (config.isDev) {
    // in development, we create an HTTPS server using self-signed certificates with no proxy
    const httpsServer = createHttpsServer(
      {
        key: fs.readFileSync(path.resolve(__dirname, '..', '..', 'cert', 'localhost-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, '..', '..', 'cert', 'localhost.pem')),
      },
      app
    );

    httpsServer.listen(config.port, 'localhost', () => {
      console.info(`Server is running on port ${config.port}.`);
    })
    .on('error', (e: Error) => console.error(e.message));
  } else {
    // in production, the certificate is managed by the web server and
    // the application should be served over HTTP behind a proxy
    const httpServer = createHttpServer(app);

    httpServer.listen(config.port, 'localhost', () => {
      console.info(`Server is running on port ${config.port}.`);
    })
    .on('error', (e: Error) => console.error(e.message));
  }
};
