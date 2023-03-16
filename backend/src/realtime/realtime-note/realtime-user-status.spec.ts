/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageType } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { RealtimeNote } from './realtime-note';
import { mockConnection } from './test-utils/mock-connection';

describe('realtime user status', () => {
  it('answers a request', () => {
    const realtimeNote = new RealtimeNote(
      Mock.of<Note>({ id: 9876 }),
      'mockedContent',
    );
    const client1 = mockConnection(realtimeNote, 'mock1');
    const client2 = mockConnection(realtimeNote, 'mock2');
    const client3 = mockConnection(realtimeNote, 'mock3');

    realtimeNote.addClient(client1);
    realtimeNote.addClient(client2);
    realtimeNote.addClient(client3);

    const sendMessage1Spy = jest.spyOn(client1.getTransporter(), 'sendMessage');
    const sendMessage2Spy = jest.spyOn(client2.getTransporter(), 'sendMessage');
    const sendMessage3Spy = jest.spyOn(client3.getTransporter(), 'sendMessage');

    client1.getTransporter().emit(MessageType.REALTIME_USER_STATE_REQUEST);

    expect(sendMessage1Spy).toHaveBeenCalledTimes(0);
    expect(sendMessage2Spy).toHaveBeenCalledWith({});
    expect(sendMessage3Spy).toHaveBeenCalledWith({});
  });
});
