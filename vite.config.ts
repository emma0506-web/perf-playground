import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 让产物使用相对路径，兼容子路径部署
// （GitHub Pages 项目页、CloudBase 子目录 等场景均可用，避免线上 404）
export default defineConfig({
  base: './',
  plugins: [react()]
})
