/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  encodeAwarenessUpdateMessage,
  encodeCompleteAwarenessStateRequestMessage,
  encodeDocumentUpdateMessage,
  WebsocketTransporter
} from '@hedgedoc/realtime'
import type { Doc } from 'yjs'
import type { Awareness } from 'y-protocols/awareness'

/**
 * Handles the communication with the realtime endpoint of the backend and synchronizes the given y-doc and awareness with other clients.
 */
export class WebsocketConnection extends WebsocketTransporter {
  constructor(url: URL, doc: Doc, awareness: Awareness) {
    super(doc, awareness)
    this.bindYDocEvents(doc)
    this.bindAwarenessMessageEvents(awareness)
    const websocket = new WebSocket(url)
    this.setupWebsocket(websocket)
  }

  private bindAwarenessMessageEvents(awareness: Awareness) {
    const updateCallback = (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => {
      if (origin !== this) {
        this.send(encodeAwarenessUpdateMessage(awareness, [...added, ...updated, ...removed]))
      }
    }
    this.on('disconnected', () => {
      awareness.destroy()
      awareness.off('update', updateCallback)
    })

    this.on('ready', () => {
      awareness.on('update', updateCallback)
    })
    this.on('synced', () => {
      this.send(encodeCompleteAwarenessStateRequestMessage())
      this.send(encodeAwarenessUpdateMessage(awareness, [awareness.doc.clientID]))
    })
  }

  private bindYDocEvents(doc: Doc): void {
    doc.on('destroy', () => this.disconnect())
    doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== this && this.isSynced()) {
        this.send(encodeDocumentUpdateMessage(update))
      }
    })
  }
}
