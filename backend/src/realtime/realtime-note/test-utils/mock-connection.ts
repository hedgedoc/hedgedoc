/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MockedBackendMessageTransporter,
  YDocSyncServerAdapter,
} from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { User } from '../../../users/user.entity';
import { Username } from '../../../utils/username';
import { RealtimeConnection } from '../realtime-connection';
import { RealtimeNote } from '../realtime-note';
import { RealtimeUserStatusAdapter } from '../realtime-user-status-adapter';

enum RealtimeUserState {
  WITHOUT,
  WITH_READWRITE,
  WITH_READONLY,
}

const MOCK_FALLBACK_USERNAME: Username = 'mock';

/**
 * Creates a mocked {@link RealtimeConnection realtime connection}.
 */
export class MockConnectionBuilder {
  private username: Username | null;
  private displayName: string | undefined;
  private includeRealtimeUserStatus: RealtimeUserState =
    RealtimeUserState.WITHOUT;

  constructor(private readonly realtimeNote: RealtimeNote) {}

  /**
   * Defines that the user who belongs to the connection is a guest.
   *
   * @param displayName the display name of the guest user
   */
  public withGuestUser(displayName: string): this {
    this.username = null;
    this.displayName = displayName;
    return this;
  }

  /**
   * Defines that the user who belongs to this connection is a logged-in user.
   *
   * @param username the username of the mocked user. If this value is omitted then the builder will user a {@link MOCK_FALLBACK_USERNAME fallback}.
   */
  public withLoggedInUser(username?: Username): this {
    const newUsername = username ?? MOCK_FALLBACK_USERNAME;
    this.username = newUsername;
    this.displayName = newUsername;
    return this;
  }

  /**
   * Defines that the connection should contain a {@link RealtimeUserStatusAdapter} that is accepting cursor updates.
   */
  public withAcceptingRealtimeUserStatus(): this {
    this.includeRealtimeUserStatus = RealtimeUserState.WITH_READWRITE;
    return this;
  }

  /**
   * Defines that the connection should contain a {@link RealtimeUserStatusAdapter} that is declining cursor updates.
   */
  public withDecliningRealtimeUserStatus(): this {
    this.includeRealtimeUserStatus = RealtimeUserState.WITH_READONLY;
    return this;
  }

  /**
   * Creates a new connection based on the given configuration.
   *
   * @return {RealtimeConnection} The constructed mocked connection
   * @throws Error if neither withGuestUser nor withLoggedInUser has been called.
   */
  public build(): RealtimeConnection {
    const displayName = this.deriveDisplayName();

    const transporter = new MockedBackendMessageTransporter('');
    const realtimeUserStateAdapter: RealtimeUserStatusAdapter =
      this.includeRealtimeUserStatus === RealtimeUserState.WITHOUT
        ? Mock.of<RealtimeUserStatusAdapter>({})
        : new RealtimeUserStatusAdapter(
            this.username ?? null,
            displayName,
            () =>
              this.realtimeNote
                .getConnections()
                .map((connection) => connection.getRealtimeUserStateAdapter()),
            transporter,
            () =>
              this.includeRealtimeUserStatus ===
              RealtimeUserState.WITH_READWRITE,
          );

    const mockUser =
      this.username === null
        ? null
        : Mock.of<User>({
            username: this.username,
            displayName: this.displayName,
          });
    const yDocSyncServerAdapter = Mock.of<YDocSyncServerAdapter>({});

    const connection = Mock.of<RealtimeConnection>({
      getUser: jest.fn(() => mockUser),
      getDisplayName: jest.fn(() => displayName),
      getSyncAdapter: jest.fn(() => yDocSyncServerAdapter),
      getTransporter: jest.fn(() => transporter),
      getRealtimeUserStateAdapter: () => realtimeUserStateAdapter,
      getRealtimeNote: () => this.realtimeNote,
    });

    transporter.on('disconnected', () =>
      this.realtimeNote.removeClient(connection),
    );

    this.realtimeNote.addClient(connection);

    return connection;
  }

  private deriveDisplayName(): string {
    if (this.displayName === undefined) {
      throw new Error(
        'Neither withGuestUser nor withLoggedInUser has been called.',
      );
    }

    return this.displayName;
  }
}
