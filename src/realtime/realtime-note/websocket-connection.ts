/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { WebsocketTransporter } from '@hedgedoc/realtime';
import { Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { Awareness, removeAwarenessStates } from 'y-protocols/awareness';

import { User } from '../../users/user.entity';
import { RealtimeNote } from './realtime-note';
import { ClientIdUpdate } from './websocket-awareness';

/**
 * Manages the websocket connection to a specific client.
 */
export class WebsocketConnection {
  protected readonly logger = new Logger(WebsocketConnection.name);
  private controlledAwarenessIds: Set<number> = new Set();
  private transporter: WebsocketTransporter;

  /**
   * Instantiates the websocket connection wrapper for a websocket connection.
   *
   * @param websocket The client's raw websocket.
   * @param user The user of the client
   * @param realtimeNote The {@link RealtimeNote} that the client connected to.
   * @throws Error if the socket is not open
   */
  constructor(
    websocket: WebSocket,
    private user: User,
    realtimeNote: RealtimeNote,
  ) {
    const awareness = realtimeNote.getAwareness();
    this.transporter = new WebsocketTransporter(
      realtimeNote.getYDoc(),
      awareness,
    );
    this.transporter.on('disconnected', () => {
      realtimeNote.removeClient(this);
    });
    this.transporter.setupWebsocket(websocket);
    this.bindAwarenessMessageEvents(awareness);
  }

  /**
   * Binds all additional events that are needed for awareness processing.
   */
  private bindAwarenessMessageEvents(awareness: Awareness): void {
    const callback = this.updateControlledAwarenessIds.bind(this);
    awareness.on('update', callback);
    this.transporter.on('disconnected', () => {
      awareness.off('update', callback);
      removeAwarenessStates(awareness, [...this.controlledAwarenessIds], this);
    });
  }

  private updateControlledAwarenessIds(
    { added, removed }: ClientIdUpdate,
    origin: WebsocketConnection,
  ): void {
    if (origin === this) {
      added.forEach((id) => this.controlledAwarenessIds.add(id));
      removed.forEach((id) => this.controlledAwarenessIds.delete(id));
    }
  }

  /**
   * Defines if the current connection has received at least one full synchronisation.
   */
  public isSynced(): boolean {
    return this.transporter.isSynced();
  }

  /**
   * Sends the given content to the client.
   *
   * @param content The content to send
   */
  public send(content: Uint8Array): void {
    this.transporter.send(content);
  }

  /**
   * Stops the connection
   */
  public disconnect(): void {
    this.transporter.disconnect();
  }

  public getControlledAwarenessIds(): ReadonlySet<number> {
    return this.controlledAwarenessIds;
  }

  public getUser(): User {
    return this.user;
  }
}
