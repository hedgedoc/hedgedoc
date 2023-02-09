/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MARKDOWN_CONTENT_CHANNEL_NAME, YDocMessageTransporter } from '@hedgedoc/commons'
import type { Awareness } from 'y-protocols/awareness'
import type { Doc } from 'yjs'

/**
 * A mocked connection that doesn't send or receive any data and is instantly ready.
 */
export class MockConnection extends YDocMessageTransporter {
  constructor(doc: Doc, awareness: Awareness) {
    super(doc, awareness)
    this.onOpen()
    this.emit('ready')
  }

  /**
   * Simulates a complete sync from the server by inserting the given content at position 0 of the editor yText channel.
   *
   * @param content The content to insert
   */
  public simulateFirstSync(content: string): void {
    const yText = this.doc.getText(MARKDOWN_CONTENT_CHANNEL_NAME)
    yText.insert(0, content)
    super.markAsSynced()
  }

  disconnect(): void {
    //Intentionally left empty because this is a mocked connection
  }

  send(): void {
    //Intentionally left empty because this is a mocked connection
  }
}
