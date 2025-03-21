/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod'
import { ServerVersionSchema } from './server-version.dto.js'

export const ServerStatusSchema = z
  .object({
    serverVersion: ServerVersionSchema,
    onlineNotes: z
      .number()
      .positive()
      .describe('Number of notes that are currently being worked on'),
    onlineUsers: z
      .number()
      .positive()
      .describe('Number of user that are currently working on notes'),
    distinctOnlineUsers: z
      .number()
      .positive()
      .describe(
        'Number of user that are currently working on notes. Each user only counts only once.',
      ),
    notesCount: z
      .number()
      .positive()
      .describe('Number of notes on the instance'),
    registeredUsers: z
      .number()
      .positive()
      .describe('Number of user that are currently registered'),
    onlineRegisteredUsers: z
      .number()
      .positive()
      .describe('Number of user that are currently registered and online'),
    distinctOnlineRegisteredUsers: z
      .number()
      .positive()
      .describe(
        'Number of user that are currently registered and online. Each user only counts only once.',
      ),
    isConnectionBusy: z
      .boolean()
      .describe('If the connection is currently busy'),
    connectionSocketQueueLength: z
      .number()
      .positive()
      .describe('Number of connections in the queue'),
    isDisconnectBusy: z
      .boolean()
      .describe('If the connection is currently busy'),
    disconnectSocketQueueLength: z
      .number()
      .positive()
      .describe('Number of disconnections in the queue'),
  })
  .describe('The server status of the HedgeDoc instance.')

export type ServerStatusDto = z.infer<typeof ServerStatusSchema>
