/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Observable } from 'lib0/observable';
import { Mock } from 'ts-mockery';

import { WebsocketAwareness } from '../websocket-awareness';

class MockAwareness extends Observable<string> {
  destroy(): void {
    //intentionally left blank
  }
}

/**
 * Provides a partial mock for {@link WebsocketAwareness}.
 */
export function mockAwareness(): WebsocketAwareness {
  return Mock.from<WebsocketAwareness>(new MockAwareness());
}
