import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: { editor: 'index.html', recruiters: 'recruiters/index.html' },
    },
  },
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
