import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      // Middleware to serve data files from parent directory
      {
        name: 'serve-data-files',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/data/')) {
              const fileName = req.url.replace('/data/', '');
              const filePath = path.resolve(__dirname, '..', fileName);

              if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                const contentType = ext === '.json' ? 'application/json'
                  : ext === '.geojson' ? 'application/geo+json'
                    : 'application/octet-stream';

                res.setHeader('Content-Type', contentType);
                res.setHeader('Access-Control-Allow-Origin', '*');

                // Stream large files
                const stat = fs.statSync(filePath);
                res.setHeader('Content-Length', stat.size);

                const readStream = fs.createReadStream(filePath);
                readStream.pipe(res);
                return;
              }
            }
            next();
          });
        },
      },
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
