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

/**
 * Sends and processes messages that are used to first-synchronize and update a {@link Doc y-doc}.
 */
export abstract class YDocSyncAdapter {
  public readonly eventEmitter = new EventEmitter2<EventMap>()

  protected doc: Doc | undefined

  private destroyYDocUpdateCallback: undefined | (() => void)
  private destroyEventListenerCallback: undefined | (() => void)
  private synced = false

  constructor(protected readonly messageTransporter: MessageTransporter) {
    this.bindDocumentSyncMessageEvents()
  }

  /**
   * Executes the given callback as soon as the sync adapter has synchronized the y-doc.
   * If the y-doc has already been synchronized then the callback is executed immediately.
   *
   * @param callback the callback to execute
   * @return The event listener that waits for the sync event
   */
  public doAsSoonAsSynced(callback: () => void): Listener {
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

  /**
   * Sets the {@link Doc y-doc} that should be synchronized.
   *
   * @param doc the doc to synchronize.
   */
  public setYDoc(doc: Doc | undefined): void {
    this.doc = doc

    this.destroyYDocUpdateCallback?.()
    if (!doc) {
      return
    }
    const yDocUpdateCallback = this.processDocUpdate.bind(this)
    doc.on('update', yDocUpdateCallback)
    this.destroyYDocUpdateCallback = () => doc.off('update', yDocUpdateCallback)
    this.eventEmitter.emit('desynced')
  }

  public destroy(): void {
    this.destroyYDocUpdateCallback?.()
    this.destroyEventListenerCallback?.()
  }

  protected bindDocumentSyncMessageEvents(): void {
    const stateRequestListener = this.messageTransporter.on(
      MessageType.NOTE_CONTENT_STATE_REQUEST,
      (payload) => {
        if (this.doc) {
          this.messageTransporter.sendMessage({
            type: MessageType.NOTE_CONTENT_UPDATE,
            payload: Array.from(
              encodeStateAsUpdate(this.doc, new Uint8Array(payload.payload))
            )
          })
        }
      },
      { objectify: true }
    ) as Listener

    const disconnectedListener = this.messageTransporter.on(
      'disconnected',
      () => {
        this.synced = false
        this.eventEmitter.emit('desynced')
        this.destroy()
      },
      { objectify: true }
    ) as Listener

    const noteContentUpdateListener = this.messageTransporter.on(
      MessageType.NOTE_CONTENT_UPDATE,
      (payload) => {
        if (this.doc) {
          applyUpdate(this.doc, new Uint8Array(payload.payload), this)
        }
      },
      { objectify: true }
    ) as Listener

    this.destroyEventListenerCallback = () => {
      stateRequestListener.off()
      disconnectedListener.off()
      noteContentUpdateListener.off()
    }
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
    if (this.doc) {
      this.messageTransporter.sendMessage({
        type: MessageType.NOTE_CONTENT_STATE_REQUEST,
        payload: Array.from(encodeStateVector(this.doc))
      })
    }
  }
}
