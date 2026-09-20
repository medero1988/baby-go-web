import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

function resolveProxyTarget(env: Record<string, string>): string {
  if (env.VITE_API_PROXY_TARGET?.trim()) {
    return env.VITE_API_PROXY_TARGET.trim().replace(/\/$/, '');
  }

  const apiUrl = env.VITE_API_URL?.trim() || '/api';
  if (/^https?:\/\//i.test(apiUrl)) {
    return new URL(apiUrl).origin;
  }

  return 'http://localhost:3000';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = resolveProxyTarget(env);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
