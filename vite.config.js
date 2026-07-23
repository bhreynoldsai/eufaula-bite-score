import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// When deployed to GitHub Pages at https://<user>.github.io/<repo>/, asset
// paths must be prefixed with /<repo>/. Set BASE_PATH in the deploy workflow.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      input: {
        // Fishing bite score (default landing page).
        main: resolve(__dirname, 'index.html'),
        // Congressional stock-trade tracker (/congress.html).
        congress: resolve(__dirname, 'congress.html'),
      },
    },
  },
});
