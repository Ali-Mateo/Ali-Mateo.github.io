import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/',            // 👈 al ser un User Page repo
  build: { outDir: 'dist' } // 👈 usa la carpeta estándar
})
