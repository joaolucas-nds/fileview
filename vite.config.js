import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // base: './' — obrigatório para deploy no GitHub Pages.
  // Sem isto, os assets ficam em /assets/... (absoluto) mas o Pages serve
  // o app em /fileview/ — os arquivos não são encontrados e a página fica em branco.
  // Se quiser caminhos explícitos (mais estável), substitua './' pelo nome do repo:
  //   base: '/fileview/'
  base: './',
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
})
