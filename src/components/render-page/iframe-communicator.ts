/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export abstract class IframeCommunicator<SEND, RECEIVE> {
  protected otherSide?: Window
  protected otherOrigin?: string

  constructor() {
    window.addEventListener('message', this.handleEvent.bind(this))
  }

  public unregisterEventListener(): void {
    window.removeEventListener('message', this.handleEvent.bind(this))
  }

  public setOtherSide(otherSide: Window, otherOrigin: string): void {
    this.otherSide = otherSide
    this.otherOrigin = otherOrigin
  }

  public unsetOtherSide(): void {
    this.otherSide = undefined
    this.otherOrigin = undefined
  }

  public getOtherSide(): Window | undefined {
    return this.otherSide
  }

  protected sendMessageToOtherSide(message: SEND): void {
    if (this.otherSide === undefined || this.otherOrigin === undefined) {
      console.error('Can\'t send message because otherSide is null', message)
      return
    }
    this.otherSide.postMessage(message, this.otherOrigin)
  }

  protected abstract handleEvent(event: MessageEvent<RECEIVE>): void;
}

