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
  let clientLoggedIn1: RealtimeConnection;
  let clientLoggedIn2: RealtimeConnection;
  let clientGuest: RealtimeConnection;
  let clientNotReady: RealtimeConnection;
  let clientDecline: RealtimeConnection;

  let clientLoggedIn1SendMessageSpy: SendMessageSpy;
  let clientLoggedIn2SendMessageSpy: SendMessageSpy;
  let clientGuestSendMessageSpy: SendMessageSpy;
  let clientNotReadySendMessageSpy: SendMessageSpy;
  let clientDeclineSendMessageSpy: SendMessageSpy;

  let realtimeNote: RealtimeNote;

  const clientLoggedIn1Username = 'logged.in1';
  const clientLoggedIn2Username = 'logged.in2';
  const clientNotReadyUsername = 'not.ready';
  const clientDeclineUsername = 'read.only';

  const guestDisplayName = 'Virtuous Mockingbird';

  function spyOnSendMessage(connection: RealtimeConnection): jest.SpyInstance {
    return jest.spyOn(connection.getTransporter(), 'sendMessage');
  }

  beforeEach(() => {
    realtimeNote = new RealtimeNote(
      Mock.of<Note>({ id: 9876 }),
      'mockedContent',
    );
    clientLoggedIn1 = new MockConnectionBuilder(realtimeNote)
      .withAcceptingRealtimeUserStatus()
      .withLoggedInUser(clientLoggedIn1Username)
      .build();
    clientLoggedIn2 = new MockConnectionBuilder(realtimeNote)
      .withAcceptingRealtimeUserStatus()
      .withLoggedInUser(clientLoggedIn2Username)
      .build();
    clientGuest = new MockConnectionBuilder(realtimeNote)
      .withAcceptingRealtimeUserStatus()
      .withGuestUser(guestDisplayName)
      .build();
    clientNotReady = new MockConnectionBuilder(realtimeNote)
      .withAcceptingRealtimeUserStatus()
      .withLoggedInUser(clientNotReadyUsername)
      .build();
    clientDecline = new MockConnectionBuilder(realtimeNote)
      .withDecliningRealtimeUserStatus()
      .withLoggedInUser(clientDeclineUsername)
      .build();

    clientLoggedIn1SendMessageSpy = spyOnSendMessage(clientLoggedIn1);
    clientLoggedIn2SendMessageSpy = spyOnSendMessage(clientLoggedIn2);
    clientGuestSendMessageSpy = spyOnSendMessage(clientGuest);
    clientNotReadySendMessageSpy = spyOnSendMessage(clientNotReady);
    clientDeclineSendMessageSpy = spyOnSendMessage(clientDecline);

    clientLoggedIn1.getTransporter().sendReady();
    clientLoggedIn2.getTransporter().sendReady();
    clientGuest.getTransporter().sendReady();
    clientDecline.getTransporter().sendReady();
  });

  it('can answer a state request', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    clientLoggedIn1
      .getTransporter()
      .emit(MessageType.REALTIME_USER_STATE_REQUEST);

    const expectedMessage1: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        ownUser: {
          styleIndex: 0,
          displayName: clientLoggedIn1Username,
        },
        users: [
          {
            active: true,
            cursor: {
              from: 0,
              to: 0,
            },
            styleIndex: 1,
            username: clientLoggedIn2Username,
            displayName: clientLoggedIn2Username,
          },
          {
            active: true,
            cursor: {
              from: 0,
              to: 0,
            },
            styleIndex: 2,
            username: null,
            displayName: guestDisplayName,
          },
        ],
      },
    };
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedMessage1,
    );
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);
  });

  it('can save an cursor update', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    const newFrom = Math.floor(Math.random() * 100);
    const newTo = Math.floor(Math.random() * 100);

    clientLoggedIn1
      .getTransporter()
      .emit(MessageType.REALTIME_USER_SINGLE_UPDATE, {
        type: MessageType.REALTIME_USER_SINGLE_UPDATE,
        payload: {
          from: newFrom,
          to: newTo,
        },
      });

    const expectedMessage2: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        ownUser: {
          styleIndex: 1,
          displayName: clientLoggedIn2Username,
        },
        users: [
          {
            active: true,
            cursor: {
              from: newFrom,
              to: newTo,
            },
            styleIndex: 0,
            username: clientLoggedIn1Username,
            displayName: clientLoggedIn1Username,
          },
          {
            active: true,
            cursor: {
              from: 0,
              to: 0,
            },
            styleIndex: 2,
            username: null,
            displayName: guestDisplayName,
          },
        ],
      },
    };

    const expectedMessage3: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        ownUser: {
          styleIndex: 2,
          displayName: guestDisplayName,
        },
        users: [
          {
            active: true,
            cursor: {
              from: newFrom,
              to: newTo,
            },
            styleIndex: 0,
            username: clientLoggedIn1Username,
            displayName: clientLoggedIn1Username,
          },
          {
            active: true,
            cursor: {
              from: 0,
              to: 0,
            },
            styleIndex: 1,
            username: clientLoggedIn2Username,
            displayName: clientLoggedIn2Username,
          },
        ],
      },
    };

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);
  });

  it('will inform other clients about removed client', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    clientLoggedIn2.getTransporter().disconnect();

    const expectedMessage1: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        ownUser: {
          styleIndex: 0,
          displayName: clientLoggedIn1Username,
        },
        users: [
          {
            active: true,
            cursor: {
              from: 0,
              to: 0,
            },
            styleIndex: 2,
            username: null,
            displayName: guestDisplayName,
          },
        ],
      },
    };

    const expectedMessage3: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        ownUser: {
          styleIndex: 2,
          displayName: guestDisplayName,
        },
        users: [
          {
            active: true,
            cursor: {
              from: 0,
              to: 0,
            },
            styleIndex: 0,
            username: clientLoggedIn1Username,
            displayName: clientLoggedIn1Username,
          },
        ],
      },
    };

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedMessage1,
    );
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);
  });

  it('will inform other clients about inactivity and reactivity', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    clientLoggedIn1
      .getTransporter()
      .emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
        type: MessageType.REALTIME_USER_SET_ACTIVITY,
        payload: {
          active: false,
        },
      });

    const expectedInactivityMessage2: Message<MessageType.REALTIME_USER_STATE_SET> =
      {
        type: MessageType.REALTIME_USER_STATE_SET,
        payload: {
          ownUser: {
            styleIndex: 1,
            displayName: clientLoggedIn2Username,
          },
          users: [
            {
              active: false,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 0,
              username: clientLoggedIn1Username,
              displayName: clientLoggedIn1Username,
            },
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 2,
              username: null,
              displayName: 'Virtuous Mockingbird',
            },
          ],
        },
      };

    const expectedInactivityMessage3: Message<MessageType.REALTIME_USER_STATE_SET> =
      {
        type: MessageType.REALTIME_USER_STATE_SET,
        payload: {
          ownUser: {
            styleIndex: 2,
            displayName: 'Virtuous Mockingbird',
          },
          users: [
            {
              active: false,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 0,
              username: clientLoggedIn1Username,
              displayName: clientLoggedIn1Username,
            },
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 1,
              username: clientLoggedIn2Username,
              displayName: clientLoggedIn2Username,
            },
          ],
        },
      };

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedInactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedInactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);

    clientLoggedIn1
      .getTransporter()
      .emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
        type: MessageType.REALTIME_USER_SET_ACTIVITY,
        payload: {
          active: false,
        },
      });

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedInactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedInactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);

    clientLoggedIn1
      .getTransporter()
      .emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
        type: MessageType.REALTIME_USER_SET_ACTIVITY,
        payload: {
          active: true,
        },
      });

    const expectedReactivityMessage2: Message<MessageType.REALTIME_USER_STATE_SET> =
      {
        type: MessageType.REALTIME_USER_STATE_SET,
        payload: {
          ownUser: {
            styleIndex: 1,
            displayName: clientLoggedIn2Username,
          },
          users: [
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 0,
              username: clientLoggedIn1Username,
              displayName: clientLoggedIn1Username,
            },
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 2,
              username: null,
              displayName: 'Virtuous Mockingbird',
            },
          ],
        },
      };

    const expectedReactivityMessage3: Message<MessageType.REALTIME_USER_STATE_SET> =
      {
        type: MessageType.REALTIME_USER_STATE_SET,
        payload: {
          ownUser: {
            styleIndex: 2,
            displayName: 'Virtuous Mockingbird',
          },
          users: [
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 0,
              username: clientLoggedIn1Username,
              displayName: clientLoggedIn1Username,
            },
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              styleIndex: 1,
              username: clientLoggedIn2Username,
              displayName: clientLoggedIn2Username,
            },
          ],
        },
      };

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedReactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedReactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(2);

    clientLoggedIn1
      .getTransporter()
      .emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
        type: MessageType.REALTIME_USER_SET_ACTIVITY,
        payload: {
          active: true,
        },
      });

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedReactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedReactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(2);
  });

  it('will ignore updates from read only clients', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    clientDecline
      .getTransporter()
      .emit(MessageType.REALTIME_USER_SINGLE_UPDATE, {
        type: MessageType.REALTIME_USER_SINGLE_UPDATE,
        payload: {
          from: 0,
          to: 1234,
        },
      });

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);
  });
});
