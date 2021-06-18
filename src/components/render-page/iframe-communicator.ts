/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Error that will be thrown if a message couldn't be sent.
 */
export class IframeCommunicatorSendingError extends Error {}

/**
 * Base class for communication between renderer and editor.
 */
export abstract class IframeCommunicator<SEND, RECEIVE> {
  private messageTarget?: Window
  private targetOrigin?: string
  private communicationEnabled: boolean

  constructor() {
    window.addEventListener('message', this.handleEvent.bind(this))
    this.communicationEnabled = false
  }

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
  protected enableCommunication(): void {
    this.communicationEnabled = true
  }

  /**
   * Sends a message to the message target.
   *
   * @param message The message to send.
   */
  protected sendMessageToOtherSide(message: SEND): void {
    if (this.messageTarget === undefined || this.targetOrigin === undefined) {
      throw new IframeCommunicatorSendingError(`Other side is not set.\nMessage was: ${JSON.stringify(message)}`)
    }
    if (!this.communicationEnabled) {
      throw new IframeCommunicatorSendingError(
        `Communication isn't enabled. Maybe the other side is not ready?\nMessage was: ${JSON.stringify(message)}`
      )
    }
    this.messageTarget.postMessage(message, this.targetOrigin)
  }

  protected abstract handleEvent(event: MessageEvent<RECEIVE>): void
}
