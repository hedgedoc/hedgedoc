/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MessageTransporter,
  MockedBackendMessageTransporter,
  YDocSyncServerAdapter,
} from '@hedgedoc/commons';
import * as HedgeDocCommonsModule from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { User } from '../../users/user.entity';
import * as NameRandomizerModule from './random-word-lists/name-randomizer';
import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';
import { RealtimeUserStatusAdapter } from './realtime-user-status-adapter';
import * as RealtimeUserStatusModule from './realtime-user-status-adapter';

jest.mock('./random-word-lists/name-randomizer');
jest.mock('./realtime-user-status-adapter');
jest.mock(
  '@hedgedoc/commons',
  () =>
    ({
      ...jest.requireActual('@hedgedoc/commons'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      YDocSyncServerAdapter: jest.fn(() => Mock.of<YDocSyncServerAdapter>({})),
    } as Record<string, unknown>),
);

describe('websocket connection', () => {
  let mockedRealtimeNote: RealtimeNote;
  let mockedUser: User;
  let mockedMessageTransporter: MessageTransporter;

  beforeEach(() => {
    mockedRealtimeNote = new RealtimeNote(Mock.of<Note>({}), '');
    mockedUser = Mock.of<User>({});

    mockedMessageTransporter = new MockedBackendMessageTransporter('');
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('returns the correct transporter', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );
    expect(sut.getTransporter()).toBe(mockedMessageTransporter);
  });

  it('returns the correct realtime note', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );
    expect(sut.getRealtimeNote()).toBe(mockedRealtimeNote);
  });

  it('returns the correct realtime user status', () => {
    const realtimeUserStatus = Mock.of<RealtimeUserStatusAdapter>();
    jest
      .spyOn(RealtimeUserStatusModule, 'RealtimeUserStatusAdapter')
      .mockImplementation(() => realtimeUserStatus);

    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    expect(sut.getRealtimeUserStateAdapter()).toBe(realtimeUserStatus);
  });

  it('returns the correct sync adapter', () => {
    const yDocSyncServerAdapter = Mock.of<YDocSyncServerAdapter>({});
    jest
      .spyOn(HedgeDocCommonsModule, 'YDocSyncServerAdapter')
      .mockImplementation(() => yDocSyncServerAdapter);

    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
    );

    expect(sut.getSyncAdapter()).toBe(yDocSyncServerAdapter);
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
