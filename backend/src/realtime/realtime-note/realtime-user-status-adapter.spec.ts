/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Message,
  MessageType,
  MockedBackendMessageTransporter,
} from '@hedgedoc/commons';

import { RealtimeUserStatusAdapter } from './realtime-user-status-adapter';

type SendMessageSpy = jest.SpyInstance<
  void,
  [Required<MockedBackendMessageTransporter['sendMessage']>]
>;

describe('realtime user status adapter', () => {
  let clientLoggedIn1: RealtimeUserStatusAdapter | undefined;
  let clientLoggedIn2: RealtimeUserStatusAdapter | undefined;
  let clientGuest: RealtimeUserStatusAdapter | undefined;
  let clientNotReady: RealtimeUserStatusAdapter | undefined;
  let clientDecline: RealtimeUserStatusAdapter | undefined;

  let clientLoggedIn1SendMessageSpy: SendMessageSpy;
  let clientLoggedIn2SendMessageSpy: SendMessageSpy;
  let clientGuestSendMessageSpy: SendMessageSpy;
  let clientNotReadySendMessageSpy: SendMessageSpy;
  let clientDeclineSendMessageSpy: SendMessageSpy;

  const clientLoggedIn1Username = 'logged.in1';
  const clientLoggedIn2Username = 'logged.in2';
  const clientNotReadyUsername = 'not.ready';
  const clientDeclineUsername = 'read.only';

  const guestDisplayName = 'Virtuous Mockingbird';

  let messageTransporterLoggedIn1: MockedBackendMessageTransporter;
  let messageTransporterLoggedIn2: MockedBackendMessageTransporter;
  let messageTransporterGuest: MockedBackendMessageTransporter;
  let messageTransporterNotReady: MockedBackendMessageTransporter;
  let messageTransporterDecline: MockedBackendMessageTransporter;

  beforeEach(() => {
    clientLoggedIn1 = undefined;
    clientLoggedIn2 = undefined;
    clientGuest = undefined;
    clientNotReady = undefined;
    clientDecline = undefined;

    messageTransporterLoggedIn1 = new MockedBackendMessageTransporter('');
    messageTransporterLoggedIn2 = new MockedBackendMessageTransporter('');
    messageTransporterGuest = new MockedBackendMessageTransporter('');
    messageTransporterNotReady = new MockedBackendMessageTransporter('');
    messageTransporterDecline = new MockedBackendMessageTransporter('');

    function otherAdapterCollector(): RealtimeUserStatusAdapter[] {
      return [
        clientLoggedIn1,
        clientLoggedIn2,
        clientGuest,
        clientNotReady,
        clientDecline,
      ].filter((value) => value !== undefined) as RealtimeUserStatusAdapter[];
    }

    clientLoggedIn1 = new RealtimeUserStatusAdapter(
      clientLoggedIn1Username,
      clientLoggedIn1Username,
      otherAdapterCollector,
      messageTransporterLoggedIn1,
      () => true,
    );
    clientLoggedIn2 = new RealtimeUserStatusAdapter(
      clientLoggedIn2Username,
      clientLoggedIn2Username,
      otherAdapterCollector,
      messageTransporterLoggedIn2,
      () => true,
    );
    clientGuest = new RealtimeUserStatusAdapter(
      null,
      guestDisplayName,
      otherAdapterCollector,
      messageTransporterGuest,
      () => true,
    );
    clientNotReady = new RealtimeUserStatusAdapter(
      clientNotReadyUsername,
      clientNotReadyUsername,
      otherAdapterCollector,
      messageTransporterNotReady,
      () => true,
    );
    clientDecline = new RealtimeUserStatusAdapter(
      clientDeclineUsername,
      clientDeclineUsername,
      otherAdapterCollector,
      messageTransporterDecline,
      () => false,
    );

    clientLoggedIn1SendMessageSpy = jest.spyOn(
      messageTransporterLoggedIn1,
      'sendMessage',
    );
    clientLoggedIn2SendMessageSpy = jest.spyOn(
      messageTransporterLoggedIn2,
      'sendMessage',
    );
    clientGuestSendMessageSpy = jest.spyOn(
      messageTransporterGuest,
      'sendMessage',
    );
    clientNotReadySendMessageSpy = jest.spyOn(
      messageTransporterNotReady,
      'sendMessage',
    );
    clientDeclineSendMessageSpy = jest.spyOn(
      messageTransporterDecline,
      'sendMessage',
    );

    messageTransporterLoggedIn1.sendReady();
    messageTransporterLoggedIn2.sendReady();
    messageTransporterGuest.sendReady();
    messageTransporterDecline.sendReady();
  });

  it('can answer a state request', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_STATE_REQUEST);

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
          {
            active: true,
            cursor: null,
            displayName: clientDeclineUsername,
            styleIndex: 4,
            username: clientDeclineUsername,
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

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SINGLE_UPDATE, {
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
          {
            active: true,
            cursor: null,
            displayName: clientDeclineUsername,
            styleIndex: 4,
            username: clientDeclineUsername,
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
          {
            active: true,
            cursor: null,
            displayName: clientDeclineUsername,
            styleIndex: 4,
            username: clientDeclineUsername,
          },
        ],
      },
    };

    const expectedMessage5: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        ownUser: {
          displayName: clientDeclineUsername,
          styleIndex: 4,
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
          {
            active: true,
            cursor: {
              from: 0,
              to: 0,
            },
            displayName: guestDisplayName,
            styleIndex: 2,
            username: null,
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
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedMessage5,
    );
  });

  it('will inform other clients about removed client', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    messageTransporterLoggedIn2.disconnect();

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
          {
            active: true,
            cursor: null,
            displayName: clientDeclineUsername,
            styleIndex: 4,
            username: clientDeclineUsername,
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
          {
            active: true,
            cursor: null,
            displayName: clientDeclineUsername,
            styleIndex: 4,
            username: clientDeclineUsername,
          },
        ],
      },
    };

    const expectedMessage5: Message<MessageType.REALTIME_USER_STATE_SET> = {
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        ownUser: {
          displayName: clientDeclineUsername,
          styleIndex: 4,
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
            displayName: guestDisplayName,
            styleIndex: 2,
            username: null,
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
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedMessage5,
    );
  });

  it('will inform other clients about inactivity and reactivity', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(0);

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
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
              displayName: guestDisplayName,
            },
            {
              active: true,
              cursor: null,
              displayName: clientDeclineUsername,
              styleIndex: 4,
              username: clientDeclineUsername,
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
            displayName: guestDisplayName,
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
            {
              active: true,
              cursor: null,
              displayName: clientDeclineUsername,
              styleIndex: 4,
              username: clientDeclineUsername,
            },
          ],
        },
      };

    const expectedInactivityMessage5: Message<MessageType.REALTIME_USER_STATE_SET> =
      {
        type: MessageType.REALTIME_USER_STATE_SET,
        payload: {
          ownUser: {
            styleIndex: 4,
            displayName: clientDeclineUsername,
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
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              displayName: guestDisplayName,
              styleIndex: 2,
              username: null,
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
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedInactivityMessage5,
    );

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
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
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedInactivityMessage5,
    );

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
      type: MessageType.REALTIME_USER_SET_ACTIVITY,
      payload: {
        active: true,
      },
    });

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
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
              displayName: guestDisplayName,
            },
            {
              active: true,
              cursor: null,
              displayName: clientDeclineUsername,
              styleIndex: 4,
              username: clientDeclineUsername,
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
              cursor: null,
              displayName: clientDeclineUsername,
              styleIndex: 4,
              username: clientDeclineUsername,
            },
          ],
        },
      };

    const expectedReactivityMessage5: Message<MessageType.REALTIME_USER_STATE_SET> =
      {
        type: MessageType.REALTIME_USER_STATE_SET,
        payload: {
          ownUser: {
            styleIndex: 4,
            displayName: clientDeclineUsername,
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
            {
              active: true,
              cursor: {
                from: 0,
                to: 0,
              },
              displayName: guestDisplayName,
              styleIndex: 2,
              username: null,
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
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedReactivityMessage5,
    );

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
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
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      1,
      expectedReactivityMessage5,
    );
  });
});
