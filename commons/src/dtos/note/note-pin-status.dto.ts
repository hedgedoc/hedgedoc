/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const NotePinStatusSchema = z
  .object({
    isPinned: z
      .boolean()
      .describe(
        'Whether the note should be pinned to the top of the explore page',
      ),
  })
  .describe('DTO for setting the pin status of a note')

export type NotePinStatusInterface = z.infer<typeof NotePinStatusSchema>
