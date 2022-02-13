/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Logger } from '../../../utils/logger'

/**
 * Error that will be thrown if a message couldn't be sent.
 */
export class IframeCommunicatorSendingError extends Error {}

export type Handler<MESSAGES, MESSAGE_TYPE extends string> = (
  values: Extract<MESSAGES, PostMessage<MESSAGE_TYPE>>
) => void

export type MaybeHandler<MESSAGES, MESSAGE_TYPE extends string> = Handler<MESSAGES, MESSAGE_TYPE> | undefined

export type HandlerMap<MESSAGES, MESSAGE_TYPE extends string> = Partial<{
  [key in MESSAGE_TYPE]: MaybeHandler<MESSAGES, MESSAGE_TYPE>
}>

export interface PostMessage<MESSAGE_TYPE extends string> {
  type: MESSAGE_TYPE
}

/**
 * Base class for communication between renderer and editor.
 */
export abstract class WindowPostMessageCommunicator<
  RECEIVE_TYPE extends string,
  SEND_TYPE extends string,
  MESSAGES extends PostMessage<RECEIVE_TYPE | SEND_TYPE>
> {
  private messageTarget?: Window
  private targetOrigin?: string
  private communicationEnabled: boolean
  private handlers: HandlerMap<MESSAGES, RECEIVE_TYPE> = {}
  private log

  constructor() {
    window.addEventListener('message', this.handleEvent.bind(this))
    this.communicationEnabled = false
    this.log = this.createLogger()
  }

  protected abstract createLogger(): Logger

  /**
   * Removes the message event listener from the {@link window}
   */
  public unregisterEventListener(): void {
    window.removeEventListener('message', this.handleEvent.bind(this))
  }

  /**
   * Sets the target for message sending.
   * Messages can be sent as soon as the communication is enabled.
   *
   * @see enableCommunication
   * @param otherSide The target {@link Window} that should receive the messages.
   * @param otherOrigin The origin from the URL of the target. If this isn't correct then the message sending will produce CORS errors.
   */
  public setMessageTarget(otherSide: Window, otherOrigin: string): void {
    this.messageTarget = otherSide
    this.targetOrigin = otherOrigin
    this.communicationEnabled = false
  }

  /**
   * Unsets the message target. Should be used if the old target isn't available anymore.
   */
  public unsetMessageTarget(): void {
    this.messageTarget = undefined
    this.targetOrigin = undefined
    this.communicationEnabled = false
  }

  /**
   * Enables the message communication.
   * Should be called as soon as the other sides is ready to receive messages.
   */
  public enableCommunication(): void {
    this.communicationEnabled = true
  }

  /**
   * Sends a message to the message target.
   *
   * @param message The message to send.
   */
  public sendMessageToOtherSide(message: Extract<MESSAGES, PostMessage<SEND_TYPE>>): void {
    if (this.messageTarget === undefined || this.targetOrigin === undefined) {
      throw new IframeCommunicatorSendingError(`Other side is not set.\nMessage was: ${JSON.stringify(message)}`)
    }
    if (!this.communicationEnabled) {
      throw new IframeCommunicatorSendingError(
        `Communication isn't enabled. Maybe the other side is not ready?\nMessage was: ${JSON.stringify(message)}`
      )
    }
    this.log.debug('Sent event', message)
    this.messageTarget.postMessage(message, this.targetOrigin)
  }

  /**
   * Sets the handler method that processes messages with the given message type.
   * If there is already a handler for the given message type then the handler will be overwritten.
   *
   * @param messageType The message type for which the handler should be called
   * @param handler The handler that processes messages with the given message type.
   */
  public setHandler<R extends RECEIVE_TYPE>(messageType: R, handler: MaybeHandler<MESSAGES, R>): void {
    this.log.debug('Set handler for', messageType)
    this.handlers[messageType] = handler as MaybeHandler<MESSAGES, RECEIVE_TYPE>
  }

  /**
   * Receives the message events and calls the handler that is mapped to the correct type.
   *
   * @param event The received event
   * @return {@code true} if the event was processed.
   */
  protected handleEvent(event: MessageEvent<PostMessage<RECEIVE_TYPE>>): boolean | undefined {
    const data = event.data

    if (!(data.type in this.handlers)) {
      return true
    }
    const handler = this.handlers[data.type]
    if (!handler) {
      return true
    }
    this.log.debug('Received event', data)
    handler(data as Extract<MESSAGES, PostMessage<RECEIVE_TYPE>>)
    return false
  }
}
