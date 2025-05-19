/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter } from '../message-transporters/index.js'
import { Message, MessageType } from '../message-transporters/message.js'
import { RealtimeDoc } from './realtime-doc.js'
import { Listener } from 'eventemitter2'
import { EventEmitter2 } from 'eventemitter2'

type EventMap = Record<'synced' | 'desynced', () => void>

/**
 * Sends and processes messages that are used to first-synchronize and update a {@link RealtimeDoc y-doc}.
 */
export abstract class YDocSyncAdapter {
  public readonly eventEmitter = new EventEmitter2<EventMap>()

  private readonly yDocUpdateListener: Listener
  private readonly destroyEventListenerCallback: undefined | (() => void)
  private synced = false

  constructor(
    protected readonly messageTransporter: MessageTransporter,
    protected readonly doc: RealtimeDoc,
  ) {
    this.yDocUpdateListener = doc.on(
      'update',
      (update, origin) => {
        this.distributeDocUpdate(update, origin)
      },
      {
        objectify: true,
      },
    ) as Listener

    this.destroyEventListenerCallback = this.bindDocumentSyncMessageEvents()
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
      objectify: true,
    }) as Listener
  }

  public isSynced(): boolean {
    return this.synced
  }

  public destroy(): void {
    this.yDocUpdateListener.off()
    this.destroyEventListenerCallback?.()
  }

  protected bindDocumentSyncMessageEvents(): () => void {
    const stateRequestListener = this.messageTransporter.on(
      MessageType.NOTE_CONTENT_STATE_REQUEST,
      (payload) => {
        this.messageTransporter.sendMessage({
          type: MessageType.NOTE_CONTENT_UPDATE,
          payload: this.doc.encodeStateAsUpdate(payload.payload),
        })
      },
      { objectify: true },
    ) as Listener

    const disconnectedListener = this.messageTransporter.on(
      'disconnected',
      () => {
        this.synced = false
        this.eventEmitter.emit('desynced')
      },
      { objectify: true },
    ) as Listener

    const noteContentUpdateListener = this.messageTransporter.on(
      MessageType.NOTE_CONTENT_UPDATE,
      (payload) => this.applyIncomingUpdatePayload(payload.payload),
      { objectify: true },
    ) as Listener

    return () => {
      stateRequestListener.off()
      disconnectedListener.off()
      noteContentUpdateListener.off()
    }
  }

  protected applyIncomingUpdatePayload(update: number[]): void {
    this.doc.applyUpdate(update, this)
  }

  private distributeDocUpdate(update: number[], origin: unknown): void {
    if (!this.isSynced() || origin === this) {
      return
    }
    const message: Message<MessageType.NOTE_CONTENT_UPDATE> = {
      type: MessageType.NOTE_CONTENT_UPDATE,
      payload: update,
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
      payload: this.doc.encodeStateVector(),
    })
  }
}
