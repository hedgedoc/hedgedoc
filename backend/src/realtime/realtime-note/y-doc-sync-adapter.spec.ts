/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { RealtimeNote } from './realtime-note';
import { MockConnectionBuilder } from './test-utils/mock-connection';

describe('y-doc-sync-adapter', () => {
  it('distributes y-doc updates to all clients', async () => {
    const realtimeNote = new RealtimeNote(
      Mock.of<Note>({ id: 1234 }),
      'nothing',
    );

    const client1 = new MockConnectionBuilder(realtimeNote)
      .withSyncAdapter()
      .build();
    const client2 = new MockConnectionBuilder(realtimeNote)
      .withSyncAdapter()
      .build();
    const client3 = new MockConnectionBuilder(realtimeNote)
      .withSyncAdapter()
      .build();
    const client4 = new MockConnectionBuilder(realtimeNote)
      .withSyncAdapter()
      .build();

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');
    const sendMessage3Spy = jest.spyOn(client3.getTransporter(), 'sendMessage');
    const sendMessage4Spy = jest.spyOn(client4.getTransporter(), 'sendMessage');

    jest.spyOn(client2.getSyncAdapter(), 'isSynced').mockReturnValue(false);

    realtimeNote
      .getDoc()
      .emit('update', [new Uint8Array([0, 1, 2, 3, 4]), client1.getSyncAdapter()]);

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
      .emit('update', [new Uint8Array([0, 1, 2, 3, 4]), client1.getSyncAdapter()]);

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage3Spy).toHaveBeenNthCalledWith(1, expectedMessage);
    expect(sendMessage4Spy).toHaveBeenNthCalledWith(2, expectedMessage);

    jest.spyOn(client2.getSyncAdapter(), 'isSynced').mockReturnValue(true);

    realtimeNote
      .getDoc()
      .emit('update', [new Uint8Array([0, 1, 2, 3, 4]), client1.getSyncAdapter()]);

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenNthCalledWith(1, expectedMessage);
    expect(sendMessage3Spy).toHaveBeenNthCalledWith(1, expectedMessage);
    expect(sendMessage4Spy).toHaveBeenNthCalledWith(3, expectedMessage);
  });
});
