/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as hedgedocRealtimeModule from '@hedgedoc/realtime';
import { WebsocketTransporter } from '@hedgedoc/realtime';
import { Mock } from 'ts-mockery';
import WebSocket from 'ws';
import * as yProtocolsAwarenessModule from 'y-protocols/awareness';

import { Note } from '../../notes/note.entity';
import { User } from '../../users/user.entity';
import * as realtimeNoteModule from './realtime-note';
import { RealtimeNote } from './realtime-note';
import { mockAwareness } from './test-utils/mock-awareness';
import { mockRealtimeNote } from './test-utils/mock-realtime-note';
import { mockWebsocketDoc } from './test-utils/mock-websocket-doc';
import { mockWebsocketTransporter } from './test-utils/mock-websocket-transporter';
import * as websocketAwarenessModule from './websocket-awareness';
import { ClientIdUpdate, WebsocketAwareness } from './websocket-awareness';
import { WebsocketConnection } from './websocket-connection';
import * as websocketDocModule from './websocket-doc';
import { WebsocketDoc } from './websocket-doc';

import SpyInstance = jest.SpyInstance;

describe('websocket connection', () => {
  let mockedDoc: WebsocketDoc;
  let mockedAwareness: WebsocketAwareness;
  let mockedRealtimeNote: RealtimeNote;
  let mockedWebsocket: WebSocket;
  let mockedUser: User;
  let mockedWebsocketTransporter: WebsocketTransporter;
  let removeAwarenessSpy: SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    mockedDoc = mockWebsocketDoc();
    mockedAwareness = mockAwareness();
    mockedRealtimeNote = mockRealtimeNote(
      Mock.of<Note>(),
      mockedDoc,
      mockedAwareness,
    );
    mockedWebsocket = Mock.of<WebSocket>({});
    mockedUser = Mock.of<User>({});
    mockedWebsocketTransporter = mockWebsocketTransporter();

    jest
      .spyOn(realtimeNoteModule, 'RealtimeNote')
      .mockImplementation(() => mockedRealtimeNote);
    jest
      .spyOn(websocketDocModule, 'WebsocketDoc')
      .mockImplementation(() => mockedDoc);
    jest
      .spyOn(websocketAwarenessModule, 'WebsocketAwareness')
      .mockImplementation(() => mockedAwareness);
    jest
      .spyOn(hedgedocRealtimeModule, 'WebsocketTransporter')
      .mockImplementation(() => mockedWebsocketTransporter);

    removeAwarenessSpy = jest
      .spyOn(yProtocolsAwarenessModule, 'removeAwarenessStates')
      .mockImplementation();
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('sets up the websocket in the constructor', () => {
    const setupWebsocketSpy = jest.spyOn(
      mockedWebsocketTransporter,
      'setupWebsocket',
    );

    new WebsocketConnection(mockedWebsocket, mockedUser, mockedRealtimeNote);

    expect(setupWebsocketSpy).toHaveBeenCalledWith(mockedWebsocket);
  });

  it('forwards sent messages to the transporter', () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    const sendFunctionSpy = jest.spyOn(mockedWebsocketTransporter, 'send');
    const sendContent = new Uint8Array();
    sut.send(sendContent);
    expect(sendFunctionSpy).toHaveBeenCalledWith(sendContent);
  });

  it('forwards disconnect calls to the transporter', () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    const disconnectFunctionSpy = jest.spyOn(
      mockedWebsocketTransporter,
      'disconnect',
    );
    sut.disconnect();
    expect(disconnectFunctionSpy).toHaveBeenCalled();
  });

  it('forwards isSynced checks to the transporter', () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    const isSyncedFunctionSpy = jest.spyOn(
      mockedWebsocketTransporter,
      'isSynced',
    );

    expect(sut.isSynced()).toBe(false);

    isSyncedFunctionSpy.mockReturnValue(true);
    expect(sut.isSynced()).toBe(true);
  });

  it('removes the client from the note on transporter disconnect', () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    const removeClientSpy = jest.spyOn(mockedRealtimeNote, 'removeClient');

    mockedWebsocketTransporter.emit('disconnected');

    expect(removeClientSpy).toHaveBeenCalledWith(sut);
  });

  it('remembers the controlled awareness-ids on awareness update', () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    const update: ClientIdUpdate = { added: [0], removed: [1], updated: [2] };
    mockedAwareness.emit('update', [update, sut]);

    expect(sut.getControlledAwarenessIds()).toEqual(new Set([0]));
  });

  it("doesn't remembers the controlled awareness-ids of other connections on awareness update", () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    const update: ClientIdUpdate = { added: [0], removed: [1], updated: [2] };
    mockedAwareness.emit('update', [update, Mock.of<WebsocketConnection>()]);

    expect(sut.getControlledAwarenessIds()).toEqual(new Set([]));
  });

  it('removes the controlled awareness ids on transport disconnect', () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    const update: ClientIdUpdate = { added: [0], removed: [1], updated: [2] };
    mockedAwareness.emit('update', [update, sut]);

    mockedWebsocketTransporter.emit('disconnected');

    expect(removeAwarenessSpy).toHaveBeenCalledWith(mockedAwareness, [0], sut);
  });

  it('saves the correct user', () => {
    const sut = new WebsocketConnection(
      mockedWebsocket,
      mockedUser,
      mockedRealtimeNote,
    );

    expect(sut.getUser()).toBe(mockedUser);
  });
});
