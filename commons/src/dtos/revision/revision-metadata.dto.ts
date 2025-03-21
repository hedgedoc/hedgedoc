/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { z } from 'zod'

export const RevisionMetadataSchema = z
  .object({
    id: z.number().describe('The id of the revision.'),
    createdAt: z.string().datetime().describe('When the revision was created.'),
    length: z
      .number()
      .positive()
      .describe('The length of the content of the revision.'),
    authorUsernames: z
      .array(z.string().toLowerCase())
      .describe(
        'A list of all usernames of the users that worked on the revision.',
      ),
    anonymousAuthorCount: z
      .number()
      .positive()
      .describe('Number of anonymous users that worked on the revision.'),
    title: z
      .string()
      .describe(
        'The title of the revision. Does not contain any markup but might be empty.',
      ),
    description: z
      .string()
      .describe(
        'The description of the revision. Does not contain any markup but might be empty.',
      ),
    tags: z
      .array(z.string())
      .describe('List of tags assigned to this revision'),
  })
  .describe('DTO that describes the metadata of a revision.')

export type RevisionMetadataDto = z.infer<typeof RevisionMetadataSchema>
