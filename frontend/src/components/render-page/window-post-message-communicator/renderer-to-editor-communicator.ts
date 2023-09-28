/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../utils/logger'
import type {
  CommunicationMessages,
  EditorToRendererMessageType,
  RendererToEditorMessageType
} from './rendering-message'
import { WindowPostMessageCommunicator } from './window-post-message-communicator'

/**
 * The communicator that is used to send messages from the renderer to the editor.
 */
export class RendererToEditorCommunicator extends WindowPostMessageCommunicator<
  EditorToRendererMessageType,
  RendererToEditorMessageType,
  CommunicationMessages
> {
  protected createLogger(uuid: string): Logger {
    return new Logger(`RendererToEditorCommunicator[${uuid}]`)
  }
}
