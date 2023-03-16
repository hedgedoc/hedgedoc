/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { RealtimeNote } from './realtime-note';
import { mockConnection } from './test-utils/mock-connection';

describe('realtime user status', () => {
  it('can answer a state request', () => {
    const realtimeNote = new RealtimeNote(
      Mock.of<Note>({ id: 9876 }),
      'mockedContent',
    );
    const client1 = mockConnection(realtimeNote, 'mock1');
    realtimeNote.addClient(client1);
    const client2 = mockConnection(realtimeNote, 'mock2');
    realtimeNote.addClient(client2);
    const client3 = mockConnection(realtimeNote, 'mock3');
    realtimeNote.addClient(client3);

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');
    const sendMessage3Spy = jest.spyOn(client3.getTransporter(), 'sendMessage');

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledTimes(0);

    client1.getTransporter().emit(MessageType.REALTIME_USER_STATE_REQUEST);

    expect(sendMessage1Spy).toHaveBeenNthCalledWith(1, {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: [
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 1,
          username: 'mock2',
        },
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 2,
          username: 'mock3',
        },
      ],
    });
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledTimes(0);
  });

  it('can save an cursor update', () => {
    const realtimeNote = new RealtimeNote(
      Mock.of<Note>({ id: 9876 }),
      'mockedContent',
    );
    const client1 = mockConnection(realtimeNote, 'mock1');
    realtimeNote.addClient(client1);
    const client2 = mockConnection(realtimeNote, 'mock2');
    realtimeNote.addClient(client2);
    const client3 = mockConnection(realtimeNote, 'mock3');
    realtimeNote.addClient(client3);

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');
    const sendMessage3Spy = jest.spyOn(client3.getTransporter(), 'sendMessage');

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledTimes(0);

    const newFrom = Math.floor(Math.random() * 100);
    const newTo = Math.floor(Math.random() * 100);

    client1.getTransporter().emit(MessageType.REALTIME_USER_SINGLE_UPDATE, {
      type: MessageType.REALTIME_USER_SINGLE_UPDATE,
      payload: {
        from: newFrom,
        to: newTo,
      },
    });

    const expectedMessage2: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: [
        {
          active: true,
          cursor: {
            from: newFrom,
            to: newTo,
          },
          styleIndex: 0,
          username: 'mock1',
        },
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 2,
          username: 'mock3',
        },
      ],
    };

    const expectedMessage3: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: [
        {
          active: true,
          cursor: {
            from: newFrom,
            to: newTo,
          },
          styleIndex: 0,
          username: 'mock1',
        },
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 1,
          username: 'mock2',
        },
      ],
    };

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenNthCalledWith(1, expectedMessage2);
    expect(sendMessage3Spy).toHaveBeenNthCalledWith(1, expectedMessage3);
  });
});
