/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import * as extendedDocModule from './extended-doc';
import { ExtendedDoc } from './extended-doc';
import { RealtimeNote } from './realtime-note';
import { mockConnection } from './test-utils/mock-connection';

describe('realtime note', () => {
  let mockedNote: Note;

  beforeEach(() => {
    mockedNote = Mock.of<Note>({ id: 4711 });
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
    const client1 = mockConnection(sut);
    sut.addClient(client1);
    expect(sut.getConnections()).toStrictEqual([client1]);
    expect(sut.hasConnections()).toBeTruthy();
    sut.removeClient(client1);
    expect(sut.getConnections()).toStrictEqual([]);
    expect(sut.hasConnections()).toBeFalsy();
  });

  it('creates a y-doc', () => {
    const initialContent = 'nothing';
    const mockedDoc = new ExtendedDoc(initialContent);
    const docSpy = jest
      .spyOn(extendedDocModule, 'ExtendedDoc')
      .mockReturnValue(mockedDoc);
    const sut = new RealtimeNote(mockedNote, initialContent);
    expect(docSpy).toHaveBeenCalledWith(initialContent);
    expect(sut.getDoc()).toBe(mockedDoc);
  });

  it('destroys y-doc on self-destruction', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const docDestroy = jest.spyOn(sut.getDoc(), 'destroy');
    sut.destroy();
    expect(docDestroy).toHaveBeenCalled();
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

  it('distributes y-doc updates to all clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');

    const client1 = mockConnection(sut);
    const client2 = mockConnection(sut);
    const client3 = mockConnection(sut);
    const client4 = mockConnection(sut);

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');
    const sendMessage3Spy = jest.spyOn(client3.getTransporter(), 'sendMessage');
    const sendMessage4Spy = jest.spyOn(client4.getTransporter(), 'sendMessage');

    sut.addClient(client1);
    sut.addClient(client2);
    sut.addClient(client3);
    sut.addClient(client4);

    jest.spyOn(client2.getSyncAdapter(), 'isSynced').mockReturnValue(false);

    sut.getDoc().emit('update', [new Uint8Array([0, 1, 2, 3, 4]), client1]);

    const expectedMessage: Message<MessageType.NOTE_CONTENT_UPDATE> = {
      payload: [0, 1, 2, 3, 4],
      type: MessageType.NOTE_CONTENT_UPDATE,
    };

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledWith(expectedMessage);
    expect(sendMessage4Spy).toHaveBeenCalledWith(expectedMessage);
  });

  it('announcePermissionChange to all clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');

    const client1 = mockConnection(sut);
    const client2 = mockConnection(sut);

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');

    sut.addClient(client1);
    sut.addClient(client2);

    const metadataMessage = { type: MessageType.METADATA_UPDATED };
    sut.announcePermissionChange();
    expect(sendMessage1Spy).toHaveBeenCalledWith(metadataMessage);
    expect(sendMessage2Spy).toHaveBeenCalledWith(metadataMessage);
    sut.removeClient(client2);
    sut.announcePermissionChange();
    expect(sendMessage1Spy).toHaveBeenCalledTimes(2);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(1);
  });

  it('announceNoteDeletion to all clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const client1 = mockConnection(sut);
    const client2 = mockConnection(sut);

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');

    sut.addClient(client1);
    sut.addClient(client2);
    const deletedMessage = { type: MessageType.DOCUMENT_DELETED };
    sut.announceNoteDeletion();
    expect(sendMessage1Spy).toHaveBeenCalledWith(deletedMessage);
    expect(sendMessage2Spy).toHaveBeenCalledWith(deletedMessage);
    sut.removeClient(client2);
    sut.announceNoteDeletion();
    expect(sendMessage1Spy).toHaveBeenCalledTimes(2);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(1);
  });
});
