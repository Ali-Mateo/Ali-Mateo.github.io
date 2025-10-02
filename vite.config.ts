import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: './',            // 👈 rutas relativas para evitar problemas
  build: { outDir: 'dist' }
})
