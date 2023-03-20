/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessagePayloads, MessageType } from './message.js'
import { EventEmitter2, Listener } from 'eventemitter2'

export type MessageEvents = MessageType | 'connected' | 'disconnected'

type MessageEventPayloadMap = {
  [E in MessageEvents]: E extends keyof MessagePayloads
    ? (message: Message<E>) => void
    : () => void
}

export enum ConnectionState {
  DISCONNECT,
  CONNECTING,
  CONNECTED
}

export abstract class MessageTransporter extends EventEmitter2<MessageEventPayloadMap> {
  private readyMessageReceived = false

  public abstract sendMessage<M extends MessageType>(content: Message<M>): void

  protected receiveMessage<L extends MessageType>(message: Message<L>): void {
    if (message.type === MessageType.SERVER_READY) {
      this.readyMessageReceived = true
    }
    this.emit(message.type, message)
  }

  public sendReady(): void {
    this.sendMessage({
      type: MessageType.SERVER_READY
    })
  }

  public abstract disconnect(): void

  public abstract getConnectionState(): ConnectionState

  protected onConnected(): void {
    this.emit('connected')
  }

  protected onDisconnecting(): void {
    this.readyMessageReceived = false
    this.emit('disconnected')
  }

  public isConnected(): boolean {
    return this.getConnectionState() === ConnectionState.CONNECTED
  }

  public isReady(): boolean {
    return this.readyMessageReceived
  }

  public doOnceAsSoonAsReady(callback: () => void): Listener | undefined {
    if (this.readyMessageReceived) {
      callback()
    } else {
      return this.once(MessageType.SERVER_READY, callback, { objectify: true }) as Listener
    }
  }

  public doAsSoonAsReady(callback: () => void): Listener {
    if (this.readyMessageReceived) {
      callback()
    }
    return this.on(MessageType.SERVER_READY, callback, {
      objectify: true
    }) as Listener
  }
}
