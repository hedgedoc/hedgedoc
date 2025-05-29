/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter, YDocSyncServerAdapter } from '@hedgedoc/commons';
import { Logger } from '@nestjs/common';

import { RealtimeNote } from './realtime-note';
import { RealtimeUserStatusAdapter } from './realtime-user-status-adapter';

/**
 * Manages the connection to a specific client.
 */
export class RealtimeConnection {
  protected readonly logger = new Logger(RealtimeConnection.name);
  private readonly transporter: MessageTransporter;
  private readonly yDocSyncAdapter: YDocSyncServerAdapter;
  private readonly realtimeUserStateAdapter: RealtimeUserStatusAdapter;

  /**
   * Instantiates the connection wrapper.
   *
   * @param messageTransporter The message transporter that handles the communication with the client.
   * @param userId The id of the user of the client
   * @param username The username of the user of the client
   * @param displayName The displayName of the user of the client
   * @param authorStyle The authorStyle of the user of the client
   * @param realtimeNote The {@link RealtimeNote} that the client connected to
   * @param acceptEdits If edits by this connection should be accepted
   * @throws Error if the socket is not open
   */
  constructor(
    messageTransporter: MessageTransporter,
    private userId: number,
    private username: string | null,
    private displayName: string,
    private authorStyle: number,
    private realtimeNote: RealtimeNote,
    public acceptEdits: boolean,
  ) {
    this.transporter = messageTransporter;

    this.transporter.on('disconnected', () => {
      realtimeNote.removeClient(this);
    });
    this.yDocSyncAdapter = new YDocSyncServerAdapter(
      this.transporter,
      realtimeNote.getRealtimeDoc(),
      () => acceptEdits,
    );
    this.realtimeUserStateAdapter = new RealtimeUserStatusAdapter(
      this.username ?? null,
      this.displayName,
      this.authorStyle,
      () =>
        this.realtimeNote
          .getConnections()
          .map((connection) => connection.getRealtimeUserStateAdapter()),
      this.getTransporter(),
      () => acceptEdits,
    );
  }

  /**
   * Returns the realtime user state adapter of this connection.
   *
   * @returns the realtime user state adapter
   */
  public getRealtimeUserStateAdapter(): RealtimeUserStatusAdapter {
    return this.realtimeUserStateAdapter;
  }

  /**
   * Returns the message transporter of this connection.
   *
   * @returns the message transporter
   */
  public getTransporter(): MessageTransporter {
    return this.transporter;
  }

  /**
   * Returns the YDoc sync adapter of this connection.
   *
   * @returns the YDoc sync adapter
   */
  public getSyncAdapter(): YDocSyncServerAdapter {
    return this.yDocSyncAdapter;
  }

  /**
   * Returns the user id of the user of this connection.
   *
   * @returns the user id
   */
  public getUserId(): number {
    return this.userId;
  }

  /**
   * Returns the display name of the user of this connection.
   *
   * @returns the display name
   */
  public getDisplayName(): string {
    return this.displayName;
  }

  /**
   * Returns the username of the user of this connection.
   *
   * @returns the username or null for guest users
   */
  public getUsername(): string | null {
    return this.username;
  }

  /**
   * Returns the author style of the user of this connection.
   *
   * @returns the author style
   */
  public getAuthorStyle(): number {
    return this.authorStyle;
  }

  /**
   * Returns the realtime note that this connection is connected to.
   *
   * @returns the realtime note
   */
  public getRealtimeNote(): RealtimeNote {
    return this.realtimeNote;
  }
}
