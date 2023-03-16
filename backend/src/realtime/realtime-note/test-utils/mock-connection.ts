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

/**
 * Provides a partial mock for {@link RealtimeConnection}.
 *
 * @param realtimeNote the {@link RealtimeNote realtime note} that belongs to the connection.
 * @param username optional username for the user
 * @return the mocked connection
 */
export function mockConnection(
  realtimeNote: RealtimeNote,
  username = 'mocked user',
): RealtimeConnection {
  const transporter = new MockedBackendMessageTransporter('');
  const yDocSyncAdapter = new YDocSyncAdapter(realtimeNote, transporter);
  let realtimeUserState: RealtimeUserStatus;

  const connection = Mock.of<RealtimeConnection>({
    getUser: jest.fn(() => Mock.of<User>({ username: 'mockedUser' })),
    getUsername: jest.fn(() => username),
    getSyncAdapter: jest.fn(() => yDocSyncAdapter),
    getTransporter: jest.fn(() => transporter),
    getRealtimeNote: jest.fn(() => realtimeNote),
    getRealtimeUserState: jest.fn(() => realtimeUserState),
  });

  realtimeUserState = new RealtimeUserStatus(username, connection);

  return connection;
}
