/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter } from '../message-transporters/message-transporter.js'
import { MessageType } from '../message-transporters/message.js'
import { Listener } from 'eventemitter2'
import { EventEmitter2 } from 'eventemitter2'
import { applyUpdate, Doc, encodeStateAsUpdate, encodeStateVector } from 'yjs'

type EventMap = Record<'synced' | 'desynced', () => void>

export abstract class YDocSync {
  private synced = false

  public readonly eventEmitter = new EventEmitter2<EventMap>()

  constructor(
    protected readonly doc: Doc,
    protected readonly messageTransporter: MessageTransporter
  ) {
    this.bindDocumentSyncMessageEvents(doc)
    this.messageTransporter.asSoonAsConnected(() => this.afterConnect())
  }

  public asSoonAsConnected(callback: () => void): Listener | undefined {
    if (this.isSynced()) {
      callback()
    } else {
      return this.eventEmitter.once('synced', callback, {
        objectify: true
      }) as Listener
    }
  }

  public isSynced(): boolean {
    return this.synced
  }

  protected bindDocumentSyncMessageEvents(doc: Doc) {
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

    doc.on('destroy', () => this.messageTransporter.disconnect())

    this.messageTransporter.on('disconnected', () => {
      this.synced = false
      this.eventEmitter.emit('desynced')
    })
  }

  protected markAsSynced(): void {
    if (this.synced) {
      return
    }
    this.synced = true
    this.eventEmitter.emit('synced')
  }

  protected afterConnect(): void {
    //empty on purpose
  }

  public requestDocumentState(): void {
    this.messageTransporter.sendMessage({
      type: MessageType.NOTE_CONTENT_STATE_REQUEST,
      payload: Array.from(encodeStateVector(this.doc))
    })
  }
}
