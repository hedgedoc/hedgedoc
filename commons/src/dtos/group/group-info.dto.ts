/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const GroupInfoSchema = z
  .object({
    name: z.string().describe('Name of the group'),
    displayName: z
      .string()
      .describe(
        'Display name of this group. This is used in the UI, when the group is mentioned.',
      ),
    special: z.boolean().describe('Is this group special?'),
  })
  .describe('DTO that contains the information about a group.')

export type GroupInfoDto = z.infer<typeof GroupInfoSchema>
