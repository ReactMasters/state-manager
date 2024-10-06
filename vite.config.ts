/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'state-manager',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // 번들에 포함하지 않을 외부 패키지 설정
      external: ['react', 'react-dom'],
      output: [
        {
          dir: 'dist',
          format: 'es',
          // ES Module은 .mjs 확장자로 출력
          entryFileNames: '[name].mjs',
          // 동적 임포트를 지원하기 위해 다음 옵션 추가
          chunkFileNames: '[name]-[hash].mjs',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        {
          dir: 'dist',
          format: 'cjs',
          // CommonJS는 .cjs 확장자로 출력
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name]-[hash].cjs',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
