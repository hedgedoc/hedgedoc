/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Logger } from '../../../utils/logger'
import { Optional } from '@mrdrogdrog/optional'
import { EventEmitter2 } from 'eventemitter2'

/**
 * Error that will be thrown if a message couldn't be sent.
 */
export class IframeCommunicatorSendingError extends Error {}

export type Handler<MESSAGES, MESSAGE_TYPE extends string> = (
  values: Extract<MESSAGES, MessagePayload<MESSAGE_TYPE>>
) => void

export interface MessagePayloadWithUuid<MESSAGE_TYPE extends string> {
  uuid: string
  payload: MessagePayload<MESSAGE_TYPE>
}

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
  private communicationEnabled: boolean
  private readonly emitter: EventEmitter2 = new EventEmitter2()
  private readonly log: Logger
  private readonly boundListener: (event: MessageEvent) => void

  public constructor(
    private readonly uuid: string,
    private readonly targetOrigin: string
  ) {
    this.boundListener = this.handleEvent.bind(this)
    this.communicationEnabled = false
    this.log = this.createLogger(uuid)
  }

  public getUuid(): string {
    return this.uuid
  }

  protected abstract createLogger(uuid: string): Logger

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
   * @see enableCommunication
   */
  public setMessageTarget(otherSide: Window): void {
    this.messageTarget = otherSide
    this.communicationEnabled = false
  }

  /**
   * Unsets the message target. Should be used if the old target isn't available anymore.
   */
  public unsetMessageTarget(): void {
    this.messageTarget = undefined
    this.communicationEnabled = false
  }

  /**
   * Enables the message communication.
   * Should be called as soon as the other sides is ready to receive messages.
   */
  public enableCommunication(): void {
    this.communicationEnabled = true
  }

  public isCommunicationEnabled(): boolean {
    return this.communicationEnabled
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
    this.messageTarget.postMessage(
      {
        uuid: this.uuid,
        payload: message
      } as MessagePayloadWithUuid<SEND_TYPE>,
      this.targetOrigin
    )
  }

  /**
   * Registers a handler for the given message type.
   *
   * @param messageType The message type for which the handler should be called
   * @param handler The handler that processes messages with the given message type.
   */
  public on<R extends RECEIVE_TYPE>(messageType: R, handler: Handler<MESSAGES, R>): void {
    this.log.debug('Set handler for', messageType)
    this.emitter.on(messageType, handler)
  }

  /**
   * Deletes a handler for the given message type.
   *
   * @param messageType The message type for which the handler should be removed
   * @param handler The handler that should be removed.
   */
  public off<R extends RECEIVE_TYPE>(messageType: R, handler: Handler<MESSAGES, R>): void {
    this.log.debug('Unset handler for', messageType)
    this.emitter.off(messageType, handler)
  }

  /**
   * Receives the message events and calls the handler that is mapped to the correct type.
   *
   * @param event The received event
   * @return {@link true} if the event was processed.
   */
  protected handleEvent(event: MessageEvent<MessagePayloadWithUuid<RECEIVE_TYPE>>): void {
    if (event.origin !== this.targetOrigin) {
      this.log.error(
        `message declined. origin was "${event.origin}" but expected "${String(this.targetOrigin)}"`,
        event.data
      )
      return
    }
    Optional.ofNullable(event.data)
      .filter((value) => value.uuid === this.uuid)
      .ifPresent((payload) => {
        event.stopPropagation()
        event.preventDefault()
        this.emitter.emit(payload.payload.type, payload.payload)
      })
  }
}
