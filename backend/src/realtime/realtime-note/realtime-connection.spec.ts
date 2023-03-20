/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MessageTransporter,
  MockedBackendMessageTransporter,
} from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { User } from '../../users/user.entity';
import * as NameRandomizerModule from './random-word-lists/name-randomizer';
import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';

jest.mock('./random-word-lists/name-randomizer');

describe('websocket connection', () => {
  let mockedRealtimeNote: RealtimeNote;
  let mockedUser: User;
  let mockedMessageTransporter: MessageTransporter;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    mockedRealtimeNote = new RealtimeNote(Mock.of<Note>({}), '');
    mockedUser = Mock.of<User>({});

    mockedMessageTransporter = new MockedBackendMessageTransporter('');
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('removes the client from the note on transporter disconnect', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    const removeClientSpy = jest.spyOn(mockedRealtimeNote, 'removeClient');

    mockedMessageTransporter.disconnect();

    expect(removeClientSpy).toHaveBeenCalledWith(sut);
  });

  it('saves the correct user', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    expect(sut.getUser()).toBe(mockedUser);
  });

  it('returns the correct username', () => {
    const mockedUserWithUsername = Mock.of<User>({ displayName: 'MockUser' });

    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUserWithUsername,
      mockedRealtimeNote,
    );

    expect(sut.getDisplayName()).toBe('MockUser');
  });

  it('returns a fallback if no username has been set', () => {
    const randomName = 'I am a random name';

    jest
      .spyOn(NameRandomizerModule, 'generateRandomName')
      .mockReturnValue(randomName);

    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    expect(sut.getDisplayName()).toBe(randomName);
  });
});
