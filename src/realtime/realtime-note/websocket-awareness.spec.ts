/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as hedgedocRealtimeModule from '@hedgedoc/realtime';
import { Mock } from 'ts-mockery';

import { RealtimeNote } from './realtime-note';
import { mockConnection } from './test-utils/mock-connection';
import { ClientIdUpdate, WebsocketAwareness } from './websocket-awareness';
import { WebsocketConnection } from './websocket-connection';
import { WebsocketDoc } from './websocket-doc';

describe('websocket-awareness', () => {
  it('distributes content updates to other synced clients', () => {
    const mockEncodedUpdate = new Uint8Array([0, 1, 2, 3]);
    const mockedEncodeUpdateFunction = jest.spyOn(
      hedgedocRealtimeModule,
      'encodeAwarenessUpdateMessage',
    );
    mockedEncodeUpdateFunction.mockReturnValue(mockEncodedUpdate);

    const mockConnection1 = mockConnection(true);
    const mockConnection2 = mockConnection(false);
    const mockConnection3 = mockConnection(true);
    const send1 = jest.spyOn(mockConnection1, 'send');
    const send2 = jest.spyOn(mockConnection2, 'send');
    const send3 = jest.spyOn(mockConnection3, 'send');

    const realtimeNote = Mock.of<RealtimeNote>({
      getYDoc(): WebsocketDoc {
        return Mock.of<WebsocketDoc>({
          on() {
            //mocked
          },
        });
      },
      getConnections(): WebsocketConnection[] {
        return [mockConnection1, mockConnection2, mockConnection3];
      },
    });

    const websocketAwareness = new WebsocketAwareness(realtimeNote);
    const mockUpdate: ClientIdUpdate = {
      added: [1],
      updated: [2],
      removed: [3],
    };
    websocketAwareness.emit('update', [mockUpdate, mockConnection1]);
    expect(send1).not.toBeCalled();
    expect(send2).not.toBeCalled();
    expect(send3).toBeCalledWith(mockEncodedUpdate);
    expect(mockedEncodeUpdateFunction).toBeCalledWith(
      websocketAwareness,
      [1, 2, 3],
    );
    websocketAwareness.destroy();
  });
});
