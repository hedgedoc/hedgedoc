/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter } from '../message-transporters/message-transporter.js'
import { Message, MessageType } from '../message-transporters/message.js'
import { Listener } from 'eventemitter2'
import { EventEmitter2 } from 'eventemitter2'
import { applyUpdate, Doc, encodeStateAsUpdate, encodeStateVector } from 'yjs'

type EventMap = Record<'synced' | 'desynced', () => void>

export abstract class YDocSyncAdapter {
  private synced = false

  public readonly eventEmitter = new EventEmitter2<EventMap>()

  constructor(
    protected readonly doc: Doc,
    protected readonly messageTransporter: MessageTransporter
  ) {
    this.bindDocumentSyncMessageEvents(doc)
  }

  public doAsSoonAsSynced(callback: () => void): Listener | undefined {
    if (this.isSynced()) {
      callback()
    }
    return this.eventEmitter.on('synced', callback, {
      objectify: true
    }) as Listener
  }

  public getMessageTransporter(): MessageTransporter {
    return this.messageTransporter
  }

  public isSynced(): boolean {
    return this.synced
  }

  protected bindDocumentSyncMessageEvents(doc: Doc): void {
    this.messageTransporter.on(
      MessageType.NOTE_CONTENT_STATE_REQUEST,
      (payload) => {
        this.messageTransporter.sendMessage({
          type: MessageType.NOTE_CONTENT_UPDATE,
          payload: Array.from(
            encodeStateAsUpdate(doc, new Uint8Array(payload.payload))
          )
        })
      }
    )

    this.messageTransporter.on(MessageType.NOTE_CONTENT_UPDATE, (payload) => {
      applyUpdate(doc, new Uint8Array(payload.payload), this)
    })

    const yDocUpdateCallback = this.processDocUpdate.bind(this)
    doc.on('update', yDocUpdateCallback)

    this.messageTransporter.on('disconnected', () => {
      this.synced = false
      this.eventEmitter.emit('desynced')
      doc.off('update', yDocUpdateCallback)
    })
  }

  private processDocUpdate(update: Uint8Array, origin: unknown): void {
    if (!this.isSynced() || origin === this) {
      return
    }
    const message: Message<MessageType.NOTE_CONTENT_UPDATE> = {
      type: MessageType.NOTE_CONTENT_UPDATE,
      payload: Array.from(update)
    }

    this.messageTransporter.sendMessage(message)
  }

  protected markAsSynced(): void {
    if (this.synced) {
      return
    }
    this.synced = true
    this.eventEmitter.emit('synced')
  }

  public requestDocumentState(): void {
    this.messageTransporter.sendMessage({
      type: MessageType.NOTE_CONTENT_STATE_REQUEST,
      payload: Array.from(encodeStateVector(this.doc))
    })
  }
}
