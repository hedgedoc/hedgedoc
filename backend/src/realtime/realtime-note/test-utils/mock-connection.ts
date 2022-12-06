/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MockedBackendMessageTransporter,
  YDocSyncServer,
} from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { User } from '../../../users/user.entity';
import { RealtimeConnection } from '../realtime-connection';
import { RealtimeNote } from '../realtime-note';

/**
 * Provides a partial mock for {@link RealtimeConnection}.
 *
 * @param realtimeNote the {@link RealtimeNote realtime note} that belongs to the connection.
 */
export function mockConnection(realtimeNote: RealtimeNote): RealtimeConnection {
  const transporter = new MockedBackendMessageTransporter('');
  const yDocSyncAdapter = new YDocSyncServer(
    realtimeNote.getDoc(),
    transporter,
  );

  return Mock.of<RealtimeConnection>({
    getUser: jest.fn(() => Mock.of<User>({ username: 'mockedUser' })),
    getUsername: jest.fn(() => 'mocked user'),
    getSyncAdapter: jest.fn(() => yDocSyncAdapter),
    getTransporter: jest.fn(() => transporter),
  });
}
