/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { WebsocketDoc } from '../websocket-doc';

/**
 * Provides a partial mock for {@link WebsocketDoc}.
 */
export function mockWebsocketDoc(): WebsocketDoc {
  return Mock.of<WebsocketDoc>({
    on: jest.fn(),
    destroy: jest.fn(),
  });
}
