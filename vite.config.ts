import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: mode === 'production' ? '/nucleus-pulse/' : '/',
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.ORACLE_URL': JSON.stringify(env.ORACLE_URL ?? ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
