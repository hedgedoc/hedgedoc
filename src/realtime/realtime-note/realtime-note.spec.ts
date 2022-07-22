/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { RealtimeNote } from './realtime-note';
import { mockAwareness } from './test-utils/mock-awareness';
import { mockConnection } from './test-utils/mock-connection';
import { mockWebsocketDoc } from './test-utils/mock-websocket-doc';
import * as websocketAwarenessModule from './websocket-awareness';
import { WebsocketAwareness } from './websocket-awareness';
import * as websocketDocModule from './websocket-doc';
import { WebsocketDoc } from './websocket-doc';

describe('realtime note', () => {
  let mockedDoc: WebsocketDoc;
  let mockedAwareness: WebsocketAwareness;
  let mockedNote: Note;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    mockedDoc = mockWebsocketDoc();
    mockedAwareness = mockAwareness();
    jest
      .spyOn(websocketDocModule, 'WebsocketDoc')
      .mockImplementation(() => mockedDoc);
    jest
      .spyOn(websocketAwarenessModule, 'WebsocketAwareness')
      .mockImplementation(() => mockedAwareness);

    mockedNote = Mock.of<Note>({ id: 'mock-note' });
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('can return the given note', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    expect(sut.getNote()).toBe(mockedNote);
  });

  it('can connect and disconnect clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const client1 = mockConnection(true);
    sut.addClient(client1);
    expect(sut.getConnections()).toStrictEqual([client1]);
    expect(sut.hasConnections()).toBeTruthy();
    sut.removeClient(client1);
    expect(sut.getConnections()).toStrictEqual([]);
    expect(sut.hasConnections()).toBeFalsy();
  });

  it('creates a y-doc and y-awareness', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    expect(sut.getYDoc()).toBe(mockedDoc);
    expect(sut.getAwareness()).toBe(mockedAwareness);
  });

  it('destroys y-doc and y-awareness on self-destruction', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const docDestroy = jest.spyOn(mockedDoc, 'destroy');
    const awarenessDestroy = jest.spyOn(mockedAwareness, 'destroy');
    sut.destroy();
    expect(docDestroy).toBeCalled();
    expect(awarenessDestroy).toBeCalled();
  });

  it('emits destroy event on destruction', async () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const destroyPromise = new Promise<void>((resolve) => {
      sut.once('destroy', () => {
        resolve();
      });
    });
    sut.destroy();
    await expect(destroyPromise).resolves.not.toThrow();
  });

  it("doesn't destroy a destroyed note", () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    sut.destroy();
    expect(() => sut.destroy()).toThrow();
  });
});
