/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from './messages/message-type.enum.js'
import type { YDocMessageTransporter } from './y-doc-message-transporter.js'
import { createEncoder, toUint8Array, writeVarUint } from 'lib0/encoding'

/**
 * Provides a keep alive ping for a given {@link WebSocket websocket} connection by sending a periodic message.
 */
export class ConnectionKeepAliveHandler {
  private pongReceived = false
  private static readonly pingTimeout = 30 * 1000
  private intervalId: NodeJS.Timer | undefined

  /**
   * Constructs the instance and starts the interval.
   *
   * @param messageTransporter The websocket to keep alive
   */
  constructor(private messageTransporter: YDocMessageTransporter) {
    this.messageTransporter.on('disconnected', () => this.stopTimer())
    this.messageTransporter.on('ready', () => this.startTimer())
    this.messageTransporter.on(String(MessageType.PING), () => {
      this.sendPongMessage()
    })
    this.messageTransporter.on(
      String(MessageType.PONG),
      () => (this.pongReceived = true)
    )
  }

  /**
   * Starts the ping timer.
   */
  public startTimer(): void {
    this.pongReceived = false
    this.intervalId = setInterval(
      () => this.check(),
      ConnectionKeepAliveHandler.pingTimeout
    )
    this.sendPingMessage()
  }

  public stopTimer(): void {
    clearInterval(this.intervalId)
  }

  /**
   * Checks if a pong has been received since the last run. If not, the connection is probably dead and will be terminated.
   */
  private check(): void {
    if (this.pongReceived) {
      this.pongReceived = false
      this.sendPingMessage()
    } else {
      this.messageTransporter.disconnect()
      console.error(
        `No pong received in the last ${ConnectionKeepAliveHandler.pingTimeout} seconds. Connection seems to be dead.`
      )
    }
  }

  private sendPingMessage(): void {
    const encoder = createEncoder()
    writeVarUint(encoder, MessageType.PING)
    this.messageTransporter.send(toUint8Array(encoder))
  }

  private sendPongMessage(): void {
    const encoder = createEncoder()
    writeVarUint(encoder, MessageType.PONG)
    this.messageTransporter.send(toUint8Array(encoder))
  }
}
