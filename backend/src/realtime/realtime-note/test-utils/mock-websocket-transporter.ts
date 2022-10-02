/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { WebsocketTransporter } from '@hedgedoc/realtime';
import { MessageTransporterEvents } from '@hedgedoc/realtime/dist/mjs/y-doc-message-transporter';
import { EventEmitter } from 'events';
import { Mock } from 'ts-mockery';
import TypedEmitter from 'typed-emitter';

class MockMessageTransporter extends (EventEmitter as new () => TypedEmitter<MessageTransporterEvents>) {
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
