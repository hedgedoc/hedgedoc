/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MockedBackendTransportAdapter,
  YDocSyncServerAdapter,
} from '@hedgedoc/commons';
import { FieldNameUser, User } from '@hedgedoc/database';
import { Mock } from 'ts-mockery';

import { RealtimeConnection } from '../realtime-connection';
import { RealtimeNote } from '../realtime-note';
import { RealtimeUserStatusAdapter } from '../realtime-user-status-adapter';
import { MockMessageTransporter } from './mock-message-transporter';

enum RealtimeUserState {
  WITHOUT,
  WITH_READWRITE,
  WITH_READONLY,
}

/**
 * Creates a mocked {@link RealtimeConnection realtime connection}.
 */
export class MockConnectionBuilder {
  private userId: number;
  private username: string | null;
  private displayName: string;
  private authorStyle: number;
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
    this.authorStyle = 8;
    this.userId = 1000;
    return this;
  }

  /**
   * Defines that the user who belongs to this connection is a logged-in user.
   *
   * @param username the username of the mocked user. If this value is omitted then the builder will user a {@link MOCK_FALLBACK_USERNAME fallback}.
   */
  public withLoggedInUser(username: string): this {
    this.username = username;
    this.displayName = username;
    this.userId = 1001;
    this.authorStyle = 1;
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
   * @returns {RealtimeConnection} The constructed mocked connection
   * @throws Error if neither withGuestUser nor withLoggedInUser has been called.
   */
  public build(): RealtimeConnection {
    const transporter = new MockMessageTransporter();
    transporter.setAdapter(new MockedBackendTransportAdapter(''));
    const realtimeUserStateAdapter: RealtimeUserStatusAdapter =
      this.includeRealtimeUserStatus === RealtimeUserState.WITHOUT
        ? Mock.of<RealtimeUserStatusAdapter>({})
        : new RealtimeUserStatusAdapter(
            this.username,
            this.displayName,
            this.authorStyle,
            () =>
              this.realtimeNote
                .getConnections()
                .map((connection) => connection.getRealtimeUserStateAdapter()),
            transporter,
            () =>
              this.includeRealtimeUserStatus ===
              RealtimeUserState.WITH_READWRITE,
          );

    const mockUser = Mock.of<User>({
      [FieldNameUser.username]: this.username,
      [FieldNameUser.displayName]: this.displayName,
      [FieldNameUser.id]: this.userId,
      [FieldNameUser.authorStyle]: this.authorStyle,
    });
    const yDocSyncServerAdapter = Mock.of<YDocSyncServerAdapter>({});

    const connection = Mock.of<RealtimeConnection>({
      getUserId: jest.fn(() => mockUser[FieldNameUser.id]),
      getUsername: jest.fn(() => mockUser[FieldNameUser.username]),
      getAuthorStyle: jest.fn(() => mockUser[FieldNameUser.authorStyle]),
      getDisplayName: jest.fn(() => mockUser[FieldNameUser.displayName]),
      getSyncAdapter: jest.fn(() => yDocSyncServerAdapter),
      getTransporter: jest.fn(() => transporter),
      getRealtimeUserStateAdapter: () => realtimeUserStateAdapter,
      getRealtimeNote: () => this.realtimeNote,
    });

    transporter.on('disconnected', () =>
      this.realtimeNote.removeClient(connection),
    );

    this.realtimeNote.addClient(connection);

    transporter.markAsReady();
    jest.advanceTimersByTime(0);

    return connection;
  }
}
