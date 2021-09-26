/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { WindowPostMessageCommunicator } from './window-post-message-communicator'
import { CommunicationMessages, EditorToRendererMessageType, RendererToEditorMessageType } from './rendering-message'

/**
 * The communicator that is used to send messages from the editor to the renderer.
 */
export class EditorToRendererCommunicator extends WindowPostMessageCommunicator<
  RendererToEditorMessageType,
  EditorToRendererMessageType,
  CommunicationMessages
> {
  protected generateLogIdentifier(): string {
    return 'E=>R'
  }
}
