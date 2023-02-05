/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export { MessageType } from './messages/message-type.enum.js'
export { ConnectionKeepAliveHandler } from './connection-keep-alive-handler.js'
export { YDocMessageTransporter } from './y-doc-message-transporter.js'
export {
  applyAwarenessUpdateMessage,
  encodeAwarenessUpdateMessage
} from './messages/awareness-update-message.js'
export {
  applyDocumentUpdateMessage,
  encodeDocumentUpdateMessage
} from './messages/document-update-message.js'
export { encodeCompleteAwarenessStateRequestMessage } from './messages/complete-awareness-state-request-message.js'
export { encodeCompleteDocumentStateRequestMessage } from './messages/complete-document-state-request-message.js'
export { encodeCompleteDocumentStateAnswerMessage } from './messages/complete-document-state-answer-message.js'
export { encodeDocumentDeletedMessage } from './messages/document-deleted-message.js'
export { encodeMetadataUpdatedMessage } from './messages/metadata-updated-message.js'
export { encodeServerVersionUpdatedMessage } from './messages/server-version-updated-message.js'

export { WebsocketTransporter } from './websocket-transporter.js'

export { parseUrl } from './utils/parse-url.js'
export {
  MissingTrailingSlashError,
  WrongProtocolError
} from './utils/errors.js'

export type { MessageTransporterEvents } from './y-doc-message-transporter.js'

export { waitForOtherPromisesToFinish } from './utils/wait-for-other-promises-to-finish.js'
