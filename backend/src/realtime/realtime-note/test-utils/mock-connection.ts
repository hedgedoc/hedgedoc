/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { User } from '../../../users/user.entity';
import { WebsocketConnection } from '../websocket-connection';

/**
 * Provides a partial mock for {@link WebsocketConnection}.
 *
 * @param synced Defines the return value for the `isSynced` function.
 */
export function mockConnection(synced: boolean): WebsocketConnection {
  return Mock.of<WebsocketConnection>({
    isSynced: jest.fn(() => synced),
    send: jest.fn(),
    getUser: jest.fn(() => Mock.of<User>({ username: 'mockedUser' })),
    getUsername: jest.fn(() => 'mocked user'),
  });
}
