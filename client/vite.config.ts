import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = parseInt(env.SERVER_PORT || '4000', 10) || 4_000;

  return {
    plugins: [
      react({
        babel: {
          // slower builds but smaller production bundles
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    server: {
      // ensure the server is accessible over the local network
      host: '0.0.0.0',
      https: {
        key: fs.readFileSync(path.resolve(__dirname, '..', 'cert', 'localhost-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, '..', 'cert', 'localhost.pem')),
      },
      proxy: mode === 'development'
        ? {
            '/api': {
              target: `https://localhost:${serverPort}`,
              changeOrigin: true,
              secure: false, // vite's proxy requires false unless --use-system-ca is passed to it
              rewrite: (path: string) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
  };
});
