/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MessageTransporter,
  MockedBackendTransportAdapter,
  YDocSyncServerAdapter,
} from '@hedgedoc/commons';
import * as HedgeDocCommonsModule from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { User } from '../../users/user.entity';
import * as NameRandomizerModule from './random-word-lists/name-randomizer';
import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';
import {
  OtherAdapterCollector,
  RealtimeUserStatusAdapter,
} from './realtime-user-status-adapter';
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
    }) as Record<string, unknown>,
);

describe('websocket connection', () => {
  let mockedRealtimeNote: RealtimeNote;
  let mockedUser: User;
  let mockedMessageTransporter: MessageTransporter;

  const mockedUserName: string = 'mocked-user-name';
  const mockedDisplayName = 'mockedDisplayName';

  beforeEach(() => {
    mockedRealtimeNote = new RealtimeNote(Mock.of<Note>({}), '');
    mockedUser = Mock.of<User>({
      username: mockedUserName,
      displayName: mockedDisplayName,
    });

    mockedMessageTransporter = new MessageTransporter();
    mockedMessageTransporter.setAdapter(new MockedBackendTransportAdapter(''));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('returns the correct transporter', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
      true,
    );
    expect(sut.getTransporter()).toBe(mockedMessageTransporter);
  });

  it('returns the correct realtime note', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
      true,
    );
    expect(sut.getRealtimeNote()).toBe(mockedRealtimeNote);
  });

  it.each([true, false])(
    'returns the correct realtime user status with acceptEdits %s',
    (acceptEdits) => {
      const realtimeUserStatus1 = Mock.of<RealtimeUserStatusAdapter>();
      const realtimeUserStatus2 = Mock.of<RealtimeUserStatusAdapter>();
      const realtimeUserStatus3 = Mock.of<RealtimeUserStatusAdapter>();

      const realtimeConnections = [
        Mock.of<RealtimeConnection>({
          getRealtimeUserStateAdapter: () => realtimeUserStatus1,
        }),
        Mock.of<RealtimeConnection>({
          getRealtimeUserStateAdapter: () => realtimeUserStatus2,
        }),
        Mock.of<RealtimeConnection>({
          getRealtimeUserStateAdapter: () => realtimeUserStatus3,
        }),
      ];

      jest
        .spyOn(mockedRealtimeNote, 'getConnections')
        .mockImplementation(() => realtimeConnections);

      const constructor = jest
        .spyOn(RealtimeUserStatusModule, 'RealtimeUserStatusAdapter')
        .mockImplementation(
          (
            username,
            displayName,
            otherAdapterCollector: OtherAdapterCollector,
            messageTransporter,
            acceptCursorUpdateProvider,
          ) => {
            expect(username).toBe(mockedUserName);
            expect(displayName).toBe(mockedDisplayName);
            expect(otherAdapterCollector()).toStrictEqual([
              realtimeUserStatus1,
              realtimeUserStatus2,
              realtimeUserStatus3,
            ]);
            expect(messageTransporter).toBe(mockedMessageTransporter);
            expect(acceptCursorUpdateProvider()).toBe(acceptEdits);
            return realtimeUserStatus1;
          },
        );

      const sut = new RealtimeConnection(
        mockedMessageTransporter,
        mockedUser,
        mockedRealtimeNote,
        acceptEdits,
      );

      expect(constructor).toHaveBeenCalledWith(
        mockedUserName,
        mockedDisplayName,
        expect.anything(),
        mockedMessageTransporter,
        expect.anything(),
      );
      expect(sut.getRealtimeUserStateAdapter()).toBe(realtimeUserStatus1);
    },
  );

  it.each([true, false])(
    'creates a sync adapter with acceptEdits %s',
    (acceptEdits) => {
      const yDocSyncServerAdapter = Mock.of<YDocSyncServerAdapter>({});
      jest
        .spyOn(HedgeDocCommonsModule, 'YDocSyncServerAdapter')
        .mockImplementation((messageTransporter, doc, acceptEditsProvider) => {
          expect(messageTransporter).toBe(mockedMessageTransporter);
          expect(acceptEditsProvider()).toBe(acceptEdits);
          expect(doc).toBe(mockedRealtimeNote.getRealtimeDoc());
          return yDocSyncServerAdapter;
        });

      const sut = new RealtimeConnection(
        mockedMessageTransporter,
        mockedUser,
        mockedRealtimeNote,
        acceptEdits,
      );

      expect(sut.getSyncAdapter()).toBe(yDocSyncServerAdapter);
    },
  );

  it('removes the client from the note on transporter disconnect', () => {
    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
      true,
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
      true,
    );

    expect(sut.getUser()).toBe(mockedUser);
  });

  it('returns the correct username', () => {
    const mockedUserWithUsername = Mock.of<User>({ displayName: 'MockUser' });

    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUserWithUsername,
      mockedRealtimeNote,
      true,
    );

    expect(sut.getDisplayName()).toBe('MockUser');
  });

  it('returns a random fallback display name if the provided user has no display name', () => {
    const randomName = 'I am a random name';

    jest
      .spyOn(NameRandomizerModule, 'generateRandomName')
      .mockReturnValue(randomName);

    mockedUser = Mock.of<User>({});

    const sut = new RealtimeConnection(
      mockedMessageTransporter,
      mockedUser,
      mockedRealtimeNote,
      true,
    );

    expect(sut.getDisplayName()).toBe(randomName);
  });
});
