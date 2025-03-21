/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const ServerVersionSchema = z
  .object({
    major: z.number().positive().describe('The major version of the server'),
    minor: z.number().positive().describe('The minor version of the server'),
    patch: z.number().positive().describe('The patch version of the server'),
    preRelease: z
      .string()
      .optional()
      .describe('The pre release text of the server'),
    commit: z.string().optional().describe('The commit of the server'),
    fullString: z.string().describe('The full version string of the server'),
  })
  .describe('The version of the HedgeDoc server.')

export type ServerVersionDto = z.infer<typeof ServerVersionSchema>
