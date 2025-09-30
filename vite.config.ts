import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Ali-Mateo.github.io/', // 👈 ¡esto es esencial para GitHub Pages!
})
