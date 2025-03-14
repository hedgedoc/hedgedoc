/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
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
   * @param realtimeNote The {@link RealtimeNote} that the client connected to.
   * @param acceptEdits If edits by this connection should be accepted.
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

  public getRealtimeUserStateAdapter(): RealtimeUserStatusAdapter {
    return this.realtimeUserStateAdapter;
  }

  public getTransporter(): MessageTransporter {
    return this.transporter;
  }

  public getSyncAdapter(): YDocSyncServerAdapter {
    return this.yDocSyncAdapter;
  }

  public getUserId(): number {
    return this.userId;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getUsername(): string | null {
    return this.username;
  }

  public getAuthorStyle(): number {
    return this.authorStyle;
  }

  public getRealtimeNote(): RealtimeNote {
    return this.realtimeNote;
  }
}
