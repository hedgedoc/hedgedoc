/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const ChangeNoteVisibilitySchema = z
  .object({
    publiclyVisible: z
      .boolean()
      .describe('Whether the note should be listed on the public explore page'),
  })
  .describe('DTO to change the visibility of a note.')

export type ChangeNoteVisibilityInterface = z.infer<
  typeof ChangeNoteVisibilitySchema
>
