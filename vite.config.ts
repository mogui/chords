import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/chords/', // Cambia questo con il nome del tuo repository GitHub
  esbuild: {
    loader: 'tsx',
  },
});
