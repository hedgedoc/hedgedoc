/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Logger } from '../../../utils/logger'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Error that will be thrown if a message couldn't be sent.
 */
export class IframeCommunicatorSendingError extends Error {}

export type Handler<MESSAGES, MESSAGE_TYPE extends string> = (
  values: Extract<MESSAGES, MessagePayload<MESSAGE_TYPE>>
) => void

export type MaybeHandler<MESSAGES, MESSAGE_TYPE extends string> = Handler<MESSAGES, MESSAGE_TYPE> | undefined

export type HandlerMap<MESSAGES, MESSAGE_TYPE extends string> = Partial<{
  [key in MESSAGE_TYPE]: MaybeHandler<MESSAGES, MESSAGE_TYPE>
}>

export interface MessagePayload<MESSAGE_TYPE extends string> {
  type: MESSAGE_TYPE
}

/**
 * Base class for communication between renderer and editor.
 */
export abstract class WindowPostMessageCommunicator<
  RECEIVE_TYPE extends string,
  SEND_TYPE extends string,
  MESSAGES extends MessagePayload<RECEIVE_TYPE | SEND_TYPE>
> {
  private messageTarget?: Window
  private targetOrigin?: string
  private communicationEnabled: boolean
  private readonly handlers: HandlerMap<MESSAGES, RECEIVE_TYPE> = {}
  private readonly log: Logger
  private readonly boundListener: (event: MessageEvent) => void

  public constructor() {
    this.boundListener = this.handleEvent.bind(this)
    this.communicationEnabled = false
    this.log = this.createLogger()
  }

  protected abstract createLogger(): Logger

  /**
   * Registers the event listener on the current global {@link window}.
   */
  public registerEventListener(): void {
    window.addEventListener('message', this.boundListener, { passive: true })
  }

  /**
   * Removes the message event listener from the {@link window}.
   */
  public unregisterEventListener(): void {
    window.removeEventListener('message', this.boundListener)
  }

  /**
   * Sets the target for message sending.
   * Messages can be sent as soon as the communication is enabled.
   *
   * @param otherSide The target {@link Window} that should receive the messages.
   * @param otherOrigin The origin from the URL of the target. If this isn't correct then the message sending will produce CORS errors.
   * @see enableCommunication
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
  public sendMessageToOtherSide(message: Extract<MESSAGES, MessagePayload<SEND_TYPE>>): void {
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
    this.log.debug(handler === undefined ? 'Unset' : 'Set', 'handler for', messageType)
    this.handlers[messageType] = handler as MaybeHandler<MESSAGES, RECEIVE_TYPE>
  }

  /**
   * Receives the message events and calls the handler that is mapped to the correct type.
   *
   * @param event The received event
   * @return {@link true} if the event was processed.
   */
  protected handleEvent(event: MessageEvent<MessagePayload<RECEIVE_TYPE>>): void {
    Optional.ofNullable(event.data).ifPresent((payload) => {
      event.stopPropagation()
      event.preventDefault()
      this.processPayload(payload)
    })
  }

  /**
   * Processes a {@link MessagePayload message payload} using the correct {@link Handler handler}.
   * @param payload The payload that should be processed
   */
  private processPayload(payload: MessagePayload<RECEIVE_TYPE>): void {
    return Optional.ofNullable<Handler<MESSAGES, RECEIVE_TYPE>>(this.handlers[payload.type]).ifPresent((handler) => {
      this.log.debug('Received event', payload)
      handler(payload as Extract<MESSAGES, MessagePayload<RECEIVE_TYPE>>)
    })
  }
}
