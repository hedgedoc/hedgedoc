/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Message,
  MessageTransporter,
  MessageType,
  MockedBackendTransportAdapter,
} from '@hedgedoc/commons';

import { RealtimeUserStatusAdapter } from './realtime-user-status-adapter';

type SendMessageSpy = jest.SpyInstance<void, [content: Message<MessageType>]>;

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

  let messageTransporterLoggedIn1: MessageTransporter;
  let messageTransporterLoggedIn2: MessageTransporter;
  let messageTransporterGuest: MessageTransporter;
  let messageTransporterNotReady: MessageTransporter;
  let messageTransporterDecline: MessageTransporter;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    clientLoggedIn1 = undefined;
    clientLoggedIn2 = undefined;
    clientGuest = undefined;
    clientNotReady = undefined;
    clientDecline = undefined;

    messageTransporterLoggedIn1 = new MessageTransporter();
    messageTransporterLoggedIn2 = new MessageTransporter();
    messageTransporterGuest = new MessageTransporter();
    messageTransporterNotReady = new MessageTransporter();
    messageTransporterDecline = new MessageTransporter();

    const mockedTransportAdapterLoggedIn1 = new MockedBackendTransportAdapter(
      '',
    );
    const mockedTransportAdapterLoggedIn2 = new MockedBackendTransportAdapter(
      '',
    );
    const mockedTransportAdapterGuest = new MockedBackendTransportAdapter('');
    const mockedTransportAdapterNotReady = new MockedBackendTransportAdapter(
      '',
    );
    const mockedTransportAdapterDecline = new MockedBackendTransportAdapter('');

    messageTransporterLoggedIn1.setAdapter(mockedTransportAdapterLoggedIn1);
    messageTransporterLoggedIn2.setAdapter(mockedTransportAdapterLoggedIn2);
    messageTransporterGuest.setAdapter(mockedTransportAdapterGuest);
    messageTransporterNotReady.setAdapter(mockedTransportAdapterNotReady);
    messageTransporterDecline.setAdapter(mockedTransportAdapterDecline);

    function otherAdapterCollector(): RealtimeUserStatusAdapter[] {
      return [
        clientLoggedIn1,
        clientLoggedIn2,
        clientGuest,
        clientNotReady,
        clientDecline,
      ].filter((value) => value !== undefined);
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

    messageTransporterLoggedIn1.markAsReady();
    messageTransporterLoggedIn2.markAsReady();
    messageTransporterGuest.markAsReady();
    messageTransporterDecline.markAsReady();

    jest.advanceTimersByTime(500);
  });

  it('can answer a state request', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);

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
      2,
      expectedMessage1,
    );
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);
  });

  it('can save an cursor update', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);

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

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedMessage5,
    );
  });

  it('will inform other clients about removed client', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);

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
      2,
      expectedMessage1,
    );
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedMessage5,
    );
  });

  it('will inform other clients about inactivity and reactivity', () => {
    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientGuestSendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenCalledTimes(1);

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

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedInactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedInactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedInactivityMessage5,
    );

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
      type: MessageType.REALTIME_USER_SET_ACTIVITY,
      payload: {
        active: false,
      },
    });

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedInactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedInactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      2,
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

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedReactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedReactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedReactivityMessage5,
    );

    messageTransporterLoggedIn1.emit(MessageType.REALTIME_USER_SET_ACTIVITY, {
      type: MessageType.REALTIME_USER_SET_ACTIVITY,
      payload: {
        active: true,
      },
    });

    expect(clientLoggedIn1SendMessageSpy).toHaveBeenCalledTimes(1);
    expect(clientLoggedIn2SendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedReactivityMessage2,
    );
    expect(clientGuestSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedReactivityMessage3,
    );
    expect(clientNotReadySendMessageSpy).toHaveBeenCalledTimes(0);
    expect(clientDeclineSendMessageSpy).toHaveBeenNthCalledWith(
      2,
      expectedReactivityMessage5,
    );
  });
});
