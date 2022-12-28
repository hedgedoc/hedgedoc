/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  applyAwarenessUpdateMessage,
  encodeAwarenessUpdateMessage
} from './messages/awareness-update-message.js'
import { encodeCompleteDocumentStateAnswerMessage } from './messages/complete-document-state-answer-message.js'
import { encodeCompleteDocumentStateRequestMessage } from './messages/complete-document-state-request-message.js'
import { applyDocumentUpdateMessage } from './messages/document-update-message.js'
import { MessageType } from './messages/message-type.enum.js'
import { encodeReadyAnswerMessage } from './messages/ready-answer-message.js'
import { encodeReadyRequestMessage } from './messages/ready-request-message.js'
import { EventEmitter2 } from 'eventemitter2'
import { Decoder, readVarUint } from 'lib0/decoding'
import { Awareness } from 'y-protocols/awareness'
import { Doc } from 'yjs'

export type Handler = (decoder: Decoder) => void

export type MessageTransporterEvents = {
  disconnected: () => void
  connected: () => void
  ready: () => void
  synced: () => void
} & Partial<Record<MessageType, Handler>>

export abstract class YDocMessageTransporter extends EventEmitter2 {
  private synced = false

  protected constructor(
    protected readonly doc: Doc,
    protected readonly awareness: Awareness
  ) {
    super()
    this.on(String(MessageType.READY_REQUEST), () => {
      this.send(encodeReadyAnswerMessage())
    })
    this.on(String(MessageType.READY_ANSWER), () => {
      this.emit('ready')
    })
    this.bindDocumentSyncMessageEvents(doc)
  }

  public isSynced(): boolean {
    return this.synced
  }

  protected onOpen(): void {
    this.emit('connected')
    this.send(encodeReadyRequestMessage())
  }

  protected onClose(): void {
    this.emit('disconnected')
  }

  protected markAsSynced(): void {
    if (!this.synced) {
      this.synced = true
      this.emit('synced')
    }
  }

  protected decodeMessage(buffer: ArrayBuffer): void {
    const data = new Uint8Array(buffer)
    const decoder = new Decoder(data)
    const messageType = readVarUint(decoder) as MessageType

    switch (messageType) {
      case MessageType.COMPLETE_DOCUMENT_STATE_REQUEST:
        this.send(encodeCompleteDocumentStateAnswerMessage(this.doc, decoder))
        break
      case MessageType.DOCUMENT_UPDATE:
        applyDocumentUpdateMessage(decoder, this.doc, this)
        break
      case MessageType.COMPLETE_DOCUMENT_STATE_ANSWER:
        applyDocumentUpdateMessage(decoder, this.doc, this)
        this.markAsSynced()
        break
      case MessageType.COMPLETE_AWARENESS_STATE_REQUEST:
        this.send(
          encodeAwarenessUpdateMessage(
            this.awareness,
            Array.from(this.awareness.getStates().keys())
          )
        )
        break
      case MessageType.AWARENESS_UPDATE:
        applyAwarenessUpdateMessage(decoder, this.awareness, this)
    }

    this.emit(String(messageType), decoder)
  }

  private bindDocumentSyncMessageEvents(doc: Doc) {
    this.on('ready', () => {
      this.send(encodeCompleteDocumentStateRequestMessage(doc))
    })
    this.on('disconnected', () => (this.synced = false))
  }

  /**
   * Sends binary data to the client. Closes the connection on errors.
   *
   * @param content The binary data to send.
   */
  public abstract send(content: Uint8Array): void

  public abstract disconnect(): void
}
