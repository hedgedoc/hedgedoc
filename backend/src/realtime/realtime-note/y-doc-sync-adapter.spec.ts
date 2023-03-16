/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Message,
  MessageType,
} from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { RealtimeNote } from './realtime-note';
import { mockConnection } from './test-utils/mock-connection';

describe('y-doc-sync-adapter', () => {
  it('distributes y-doc updates to all clients', async () => {
    const realtimeNote = new RealtimeNote(
      Mock.of<Note>({ id: 1234 }),
      'nothing',
    );

    const client1 = mockConnection(realtimeNote);
    const client2 = mockConnection(realtimeNote);
    const client3 = mockConnection(realtimeNote);
    const client4 = mockConnection(realtimeNote);

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');
    const sendMessage3Spy = jest.spyOn(client3.getTransporter(), 'sendMessage');
    const sendMessage4Spy = jest.spyOn(client4.getTransporter(), 'sendMessage');

    realtimeNote.addClient(client1);
    realtimeNote.addClient(client2);
    realtimeNote.addClient(client3);
    realtimeNote.addClient(client4);

    jest.spyOn(client2.getSyncAdapter(), 'isSynced').mockReturnValue(false);

    realtimeNote
      .getDoc()
      .emit('update', [new Uint8Array([0, 1, 2, 3, 4]), client1]);

    const expectedMessage: Message<MessageType.NOTE_CONTENT_UPDATE> = {
      payload: [0, 1, 2, 3, 4],
      type: MessageType.NOTE_CONTENT_UPDATE,
    };

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenCalledWith(expectedMessage);
    expect(sendMessage4Spy).toHaveBeenCalledWith(expectedMessage);

    realtimeNote.removeClient(client3);

    realtimeNote
      .getDoc()
      .emit('update', [new Uint8Array([0, 1, 2, 3, 4]), client1]);

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenNthCalledWith(1, expectedMessage);
    expect(sendMessage4Spy).toHaveBeenNthCalledWith(2, expectedMessage);
  });
});
