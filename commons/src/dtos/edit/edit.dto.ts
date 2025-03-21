/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const EditSchema = z
  .object({
    username: z
      .string()
      .nullable()
      .describe('The username who changed this section of the note'),
    startPosition: z
      .number()
      .positive()
      .describe('The offset where the change starts in the note'),
    endPosition: z
      .number()
      .positive()
      .describe('The offset where the change ends in the note'),
    createdAt: z.string().datetime().describe('When this edit happened'),
    updatedAt: z.string().datetime().describe('When this edit was updated?'),
  })
  .describe('A edit in a note by username from startPosition to endPosition.')

export type EditDto = z.infer<typeof EditSchema>
