/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { WebsocketTransporter } from '@hedgedoc/commons';
import { EventEmitter2 } from 'eventemitter2';
import { Mock } from 'ts-mockery';

class MockMessageTransporter extends EventEmitter2 {
  setupWebsocket(): void {
    //intentionally left blank
  }

  send(): void {
    //intentionally left blank
  }

  isSynced(): boolean {
    return false;
  }

  disconnect(): void {
    //intentionally left blank
  }
}

/**
 * Provides a partial mock for {@link WebsocketTransporter}.
 */
export function mockWebsocketTransporter(): WebsocketTransporter {
  return Mock.from<WebsocketTransporter>(new MockMessageTransporter());
}
