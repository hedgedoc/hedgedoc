/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeUser, RemoteCursor } from './realtime-user.js'

export enum MessageType {
  NOTE_CONTENT_STATE_REQUEST = 'NOTE_CONTENT_STATE_REQUEST',
  NOTE_CONTENT_UPDATE = 'NOTE_CONTENT_UPDATE',
  PING = 'PING',
  PONG = 'PONG',
  METADATA_UPDATED = 'METADATA_UPDATED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  SERVER_VERSION_UPDATED = 'SERVER_VERSION_UPDATED',
  REALTIME_USER_STATE_SET = 'REALTIME_USER_STATE_SET',
  REALTIME_USER_SINGLE_UPDATE = 'REALTIME_USER_SINGLE_UPDATE',
  REALTIME_USER_STATE_REQUEST = 'REALTIME_USER_STATE_REQUEST',
  READY = 'READY'
}

export interface MessagePayloads {
  [MessageType.NOTE_CONTENT_STATE_REQUEST]: number[]
  [MessageType.NOTE_CONTENT_UPDATE]: number[]
  [MessageType.REALTIME_USER_STATE_SET]: {
    users: RealtimeUser[]
    ownUser: {
      displayName: string
      styleIndex: number
    }
  }
  [MessageType.REALTIME_USER_SINGLE_UPDATE]: RemoteCursor
}

export type Message<T extends MessageType> = T extends keyof MessagePayloads
  ? {
      type: T
      payload: MessagePayloads[T]
    }
  : {
      type: T
    }
