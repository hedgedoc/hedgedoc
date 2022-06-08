/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 15000,
  video: false,
  projectId: 'ht3vbo',

  e2e: {
    baseUrl: 'http://127.0.0.1:3001/',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  }
})
