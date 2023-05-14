/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter, YDocSyncServerAdapter } from '@hedgedoc/commons';
import { Logger } from '@nestjs/common';

import { User } from '../../users/user.entity';
import { generateRandomName } from './random-word-lists/name-randomizer';
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
  private readonly displayName: string;

  /**
   * Instantiates the connection wrapper.
   *
   * @param messageTransporter The message transporter that handles the communication with the client.
   * @param user The user of the client
   * @param realtimeNote The {@link RealtimeNote} that the client connected to.
   * @param acceptEdits If edits by this connection should be accepted.
   * @throws Error if the socket is not open
   */
  constructor(
    messageTransporter: MessageTransporter,
    private user: User | null,
    private realtimeNote: RealtimeNote,
    public acceptEdits: boolean,
  ) {
    this.displayName = user?.displayName ?? generateRandomName();
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
      this.user?.username ?? null,
      this.getDisplayName(),
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

  public getUser(): User | null {
    return this.user;
  }

  public getSyncAdapter(): YDocSyncServerAdapter {
    return this.yDocSyncAdapter;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getRealtimeNote(): RealtimeNote {
    return this.realtimeNote;
  }
}
