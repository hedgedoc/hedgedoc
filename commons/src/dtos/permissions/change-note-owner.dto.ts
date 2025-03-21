/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'

export const ChangeNoteOwnerSchema = z
  .object({
    owner: z.string().describe('The username of the new owner.'),
  })
  .describe('DTO to change the owner of a note.')

export type ChangeNoteOwnerDto = z.infer<typeof ChangeNoteOwnerSchema>
