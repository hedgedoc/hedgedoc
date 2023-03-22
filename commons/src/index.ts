/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export * from './message-transporters/mocked-backend-message-transporter.js'
export * from './message-transporters/message.js'
export * from './message-transporters/message-transporter.js'
export * from './message-transporters/realtime-user.js'
export * from './message-transporters/websocket-transporter.js'

export { parseUrl } from './utils/parse-url.js'
export {
  MissingTrailingSlashError,
  WrongProtocolError
} from './utils/errors.js'

export * from './y-doc-sync/y-doc-sync-client-adapter.js'
export * from './y-doc-sync/y-doc-sync-server-adapter.js'
export * from './y-doc-sync/y-doc-sync-adapter.js'

export { waitForOtherPromisesToFinish } from './utils/wait-for-other-promises-to-finish.js'

export { RealtimeDoc } from './y-doc-sync/realtime-doc'
