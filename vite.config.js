import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build: {
    // The @mlc-ai/web-llm engine is a deliberately code-split ~6MB chunk, fetched ONLY when a
    // visitor switches the chat to on-device mode. Rollup warns about it on every build, which
    // trains you to ignore warnings. Raise the bar past it so a genuinely oversized chunk is
    // still loud.
    chunkSizeWarningLimit: 7000,
  },
  plugins: [react(), tailwindcss()],
  base: '/',
})