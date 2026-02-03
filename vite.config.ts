// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // ⬅️ usklajeno s package.json

export default defineConfig({
  plugins: [react()],
  base: '/', // pravilno za custom domeno na rootu (https://sacredescapes.eu)
})
