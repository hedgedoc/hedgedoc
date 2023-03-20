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

/**
 * Base class for event based message communication.
 */
export abstract class MessageTransporter extends EventEmitter2<MessageEventPayloadMap> {
  private readyMessageReceived = false

  public abstract sendMessage<M extends MessageType>(content: Message<M>): void

  protected receiveMessage<L extends MessageType>(message: Message<L>): void {
    if (message.type === MessageType.READY) {
      this.readyMessageReceived = true
    }
    this.emit(message.type, message)
  }

  public sendReady(): void {
    this.sendMessage({
      type: MessageType.READY
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

  /**
   * Indicates if the message transporter is connected and can send/receive messages.
   */
  public isConnected(): boolean {
    return this.getConnectionState() === ConnectionState.CONNECTED
  }

  /**
   * Indicates if the message transporter has receives a {@link MessageType.READY ready message} yet.
   */
  public isReady(): boolean {
    return this.readyMessageReceived
  }

  /**
   * Executes the given callback whenever the message transporter receives a ready message.
   * If the messenger has already received a ready message then the callback will be executed immediately.
   *
   * @param callback The callback to execute when ready
   * @return The event listener that waits for ready messages
   */
  public doAsSoonAsReady(callback: () => void): Listener {
    if (this.readyMessageReceived) {
      callback()
    }
    return this.on(MessageType.READY, callback, {
      objectify: true
    }) as Listener
  }

  /**
   * Executes the given callback whenever the message transporter has established a connection.
   * If the messenger is already connected then the callback will be executed immediately.
   *
   * @param callback The callback to execute when connected
   * @return The event listener that waits for connection events
   */
  public doAsSoonAsConnected(callback: () => void): Listener {
    if (this.isConnected()) {
      callback()
    }
    return this.on('connected', callback, {
      objectify: true
    }) as Listener
  }
}
