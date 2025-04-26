/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['cypress/**/*'],
    alias: [
      {
        find: /^.+\\.(svg)$/,
        replacement: resolve(__dirname, './src/test-utils/svg-mock.tsx')
      },
      {
        find: /^react-bootstrap-icons$/,
        replacement: resolve(__dirname, './src/test-utils/bootstrap-icon-mocks.tsx')
      },
      {
        find: RegExp('^react-bootstrap-icons/dist/icons/.*$'),
        replacement: resolve(__dirname, './src/test-utils/svg-mock.tsx')
      }
    ],
    setupFiles: './vitest.setup.ts'
  },
  plugins: [react()]
})
