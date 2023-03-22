/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType, RealtimeDoc } from '@hedgedoc/commons';
import * as hedgedocCommonsModule from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { RealtimeNote } from './realtime-note';
import { MockConnectionBuilder } from './test-utils/mock-connection';

jest.mock('@hedgedoc/commons');

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
    const client1 = new MockConnectionBuilder(sut).build();
    expect(sut.getConnections()).toStrictEqual([client1]);
    expect(sut.hasConnections()).toBeTruthy();
    sut.removeClient(client1);
    expect(sut.getConnections()).toStrictEqual([]);
    expect(sut.hasConnections()).toBeFalsy();
  });

  it('creates a y-doc', () => {
    const initialContent = 'nothing';
    const mockedDoc = new RealtimeDoc(initialContent);
    const docSpy = jest
      .spyOn(hedgedocCommonsModule, 'RealtimeDoc')
      .mockReturnValue(mockedDoc);
    const sut = new RealtimeNote(mockedNote, initialContent);
    expect(docSpy).toHaveBeenCalledWith(initialContent);
    expect(sut.getRealtimeDoc()).toBe(mockedDoc);
  });

  it('destroys y-doc on self-destruction', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');
    const docDestroy = jest.spyOn(sut.getRealtimeDoc(), 'destroy');
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

  it('announcePermissionChange to all clients', () => {
    const sut = new RealtimeNote(mockedNote, 'nothing');

    const client1 = new MockConnectionBuilder(sut).build();
    const client2 = new MockConnectionBuilder(sut).build();

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');

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
    const client1 = new MockConnectionBuilder(sut).build();
    const client2 = new MockConnectionBuilder(sut).build();

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');

    const deletedMessage = { type: MessageType.DOCUMENT_DELETED };
    sut.announceNoteDeletion();
    expect(sendMessage1Spy).toHaveBeenCalledWith(deletedMessage);
    expect(sendMessage2Spy).toHaveBeenCalledWith(deletedMessage);
    sut.removeClient(client2);
    sut.announceNoteDeletion();
    expect(sendMessage1Spy).toHaveBeenNthCalledWith(2, deletedMessage);
    expect(sendMessage2Spy).toHaveBeenNthCalledWith(1, deletedMessage);
  });
});
