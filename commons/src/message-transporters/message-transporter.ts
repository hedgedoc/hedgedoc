/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessagePayloads, MessageType } from './message.js';
import { Message } from './message.js';
import { EventEmitter2, Listener } from 'eventemitter2';


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
  public abstract sendMessage<M extends MessageType>(content: Message<M>): void

  protected receiveMessage<L extends MessageType>(message: Message<L>): void {
    this.emit(message.type, message)
  }

  public abstract disconnect(): void

  public abstract getConnectionState(): ConnectionState

  protected onConnected(): void {
    this.emit('connected')
  }

  protected onDisconnecting(): void {
    this.emit('disconnected')
  }

  public doOnceAsSoonAsConnected(callback: () => void): Listener | undefined {
    if (this.getConnectionState() === ConnectionState.CONNECTED) {
      callback()
    } else {
      return this.once('connected', callback, { objectify: true }) as Listener
    }
  }

  public doAsSoonAsConnected(callback: () => void): Listener | undefined {
    if (this.getConnectionState() === ConnectionState.CONNECTED) {
      callback()
    }
    return this.on('connected', callback, { objectify: true }) as Listener
  }
}
