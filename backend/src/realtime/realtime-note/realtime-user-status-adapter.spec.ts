/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageTransporter, MessageType } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';
import { MockConnectionBuilder } from './test-utils/mock-connection';

type SendMessageSpy = jest.SpyInstance<
  void,
  [Required<MessageTransporter['sendMessage']>]
>;

describe('realtime user status adapter', () => {
  let client1: RealtimeConnection;
  let client2: RealtimeConnection;
  let client3: RealtimeConnection;
  let client4: RealtimeConnection;

  let sendMessage1Spy: SendMessageSpy;
  let sendMessage2Spy: SendMessageSpy;
  let sendMessage3Spy: SendMessageSpy;
  let sendMessage4Spy: SendMessageSpy;

  let realtimeNote: RealtimeNote;

  const username1 = 'mock1';
  const username2 = 'mock2';
  const username3 = 'mock3';
  const username4 = 'mock4';

  beforeEach(() => {
    realtimeNote = new RealtimeNote(
      Mock.of<Note>({ id: 9876 }),
      'mockedContent',
    );
    client1 = new MockConnectionBuilder(realtimeNote)
      .withRealtimeUserState()
      .withUsername(username1)
      .build();
    client2 = new MockConnectionBuilder(realtimeNote)
      .withRealtimeUserState()
      .withUsername(username2)
      .build();
    client3 = new MockConnectionBuilder(realtimeNote)
      .withRealtimeUserState()
      .withUsername(username3)
      .build();
    client4 = new MockConnectionBuilder(realtimeNote)
      .withRealtimeUserState()
      .withUsername(username4)
      .build();

    sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');
    sendMessage3Spy = jest.spyOn(client3.getTransporter(), 'sendMessage');
    sendMessage4Spy = jest.spyOn(client4.getTransporter(), 'sendMessage');

    client1.getTransporter().sendReady();
    client2.getTransporter().sendReady();
    client3.getTransporter().sendReady();
    //client 4 shouldn't be ready on purpose
  });

  it('can answer a state request', () => {
    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage4Spy).toHaveBeenCalledTimes(0);

    client1.getTransporter().emit(MessageType.REALTIME_USER_STATE_REQUEST);

    const expectedMessage1: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: [
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 1,
          username: username2,
          displayName: username2,
        },
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 2,
          username: username3,
          displayName: username3,
        },
      ],
    };
    expect(sendMessage1Spy).toHaveBeenNthCalledWith(1, expectedMessage1);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage4Spy).toHaveBeenCalledTimes(0);
  });

  it('can save an cursor update', () => {
    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage4Spy).toHaveBeenCalledTimes(0);

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
          username: username1,
          displayName: username1,
        },
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 2,
          username: username3,
          displayName: username3,
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
          username: username1,
          displayName: username1,
        },
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 1,
          username: username2,
          displayName: username2,
        },
      ],
    };

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenNthCalledWith(1, expectedMessage2);
    expect(sendMessage3Spy).toHaveBeenNthCalledWith(1, expectedMessage3);
    expect(sendMessage4Spy).toHaveBeenCalledTimes(0);
  });

  it('will inform other clients about removed client', () => {
    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage4Spy).toHaveBeenCalledTimes(0);

    client2.getTransporter().disconnect();

    const expectedMessage1: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: [
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 2,
          username: username3,
          displayName: username3,
        },
      ],
    };

    const expectedMessage3: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: [
        {
          active: true,
          cursor: {
            from: 0,
            to: 0,
          },
          styleIndex: 0,
          username: username1,
          displayName: username1,
        },
      ],
    };

    expect(sendMessage1Spy).toHaveBeenNthCalledWith(1, expectedMessage1);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenNthCalledWith(1, expectedMessage3);
    expect(sendMessage4Spy).toHaveBeenCalledTimes(0);
  });
});
