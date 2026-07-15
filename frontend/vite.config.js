import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeui from 'frappe-ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // buildConfig off: it auto-targets a sibling Frappe app's public/frontend
    // dir, which doesn't exist until the bench app is scaffolded.
    frappeui({ buildConfig: false, frontendRoute: '/cmms' }),
    vue(),
  ],
})
