/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MockedBackendMessageTransporter } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { User } from '../../../users/user.entity';
import { RealtimeConnection } from '../realtime-connection';
import { RealtimeNote } from '../realtime-note';
import { RealtimeUserStatus } from '../realtime-user-status';
import { YDocSyncAdapter } from '../y-doc-sync-adapter';

export class MockConnectionBuilder {
  private username = 'mock';
  private includeSyncAdapter = false;
  private includeRealtimeUserState = false;

  constructor(private readonly realtimeNote: RealtimeNote) {}

  public withUsername(username: string): this {
    this.username = username;
    return this;
  }

  public withRealtimeUserState(): this {
    this.includeRealtimeUserState = true;
    return this;
  }

  public withSyncAdapter(): this {
    this.includeSyncAdapter = true;
    return this;
  }

  public build(): RealtimeConnection {
    const transporter = new MockedBackendMessageTransporter('');
    const yDocSyncAdapter: YDocSyncAdapter = this.includeSyncAdapter
      ? new YDocSyncAdapter(this.realtimeNote, transporter)
      : Mock.of<YDocSyncAdapter>({});

    let realtimeUserState: RealtimeUserStatus = Mock.of<RealtimeUserStatus>();

    const connection = Mock.of<RealtimeConnection>({
      getUser: jest.fn(() => Mock.of<User>({ username: this.username })),
      getDisplayName: jest.fn(() => this.username),
      getSyncAdapter: jest.fn(() => yDocSyncAdapter),
      getTransporter: jest.fn(() => transporter),
      getRealtimeUserState: () => realtimeUserState,
      getRealtimeNote: () => this.realtimeNote,
    });

    if (this.includeRealtimeUserState) {
      realtimeUserState = new RealtimeUserStatus(this.username, connection);
    }

    this.realtimeNote.addClient(connection);

    return connection;
  }
}
