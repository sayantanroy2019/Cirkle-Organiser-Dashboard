import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Pinned to an origin the backend's CORS allow-list already contains.
    // The consumer app runs on 5173 (and proxies /api, so it never needs CORS
    // in dev), which leaves 5174 for this dashboard.
    port: 5174,
    strictPort: true,
  },
})
