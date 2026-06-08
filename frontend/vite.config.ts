import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Makes VITE_API_URL available as import.meta.env.VITE_API_URL
  },
})