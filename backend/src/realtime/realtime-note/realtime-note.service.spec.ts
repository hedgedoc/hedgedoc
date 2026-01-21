/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { FieldNameRevision, Revision } from '@hedgedoc/database';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Mock } from 'ts-mockery';

import { NoteConfig } from '../../config/note.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { PermissionService } from '../../permissions/permission.service';
import { RevisionsService } from '../../revisions/revisions.service';
import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteStore } from './realtime-note-store';
import { RealtimeNoteService } from './realtime-note.service';
import { MockConnectionBuilder } from './test-utils/mock-connection';

describe('RealtimeNoteService', () => {
  const mockedContent = 'mockedContent';
  const mockedYjsState = [1, 2, 3];
  const mockedYjsStateBuffer = new Uint8Array(mockedYjsState).buffer;
  const mockedNoteId = 4711;

  let realtimeNote: RealtimeNote;
  let realtimeNoteService: RealtimeNoteService;
  let revisionsService: RevisionsService;
  let realtimeNoteStore: RealtimeNoteStore;
  let mockedPermissionService: PermissionService;
  let consoleLoggerService: ConsoleLoggerService;
  let mockedNoteConfig: NoteConfig;
  let addIntervalSpy: jest.SpyInstance;
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;
  let clientWithReadWrite: RealtimeConnection;
  let clientWithRead: RealtimeConnection;
  let clientWithoutReadWrite: RealtimeConnection;
  let deleteIntervalSpy: jest.SpyInstance;

  const readWriteUserId = 2;
  const onlyReadUserId = 1;
  const noAccessUserId = 0;

  const mockedAlias = 'mocked-alias';

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  function mockGetLatestRevision(latestRevisionExists: boolean, hasYjsState = false) {
    jest.spyOn(revisionsService, 'getLatestRevision').mockImplementation((noteId: number) =>
      noteId === mockedNoteId && latestRevisionExists
        ? Promise.resolve(
            Mock.of<Revision>({
              [FieldNameRevision.content]: mockedContent,
              ...(hasYjsState
                ? {
                    [FieldNameRevision.yjsStateVector]: Buffer.from(mockedYjsStateBuffer),
                  }
                : {}),
            }),
          )
        : Promise.reject('Revision for note mockedNoteId not found.'),
    );
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    realtimeNote = new RealtimeNote(mockedNoteId, mockedContent);

    revisionsService = Mock.of<RevisionsService>({
      getLatestRevision: jest.fn(),
      createRevision: jest.fn(),
    });

    consoleLoggerService = Mock.of<ConsoleLoggerService>({
      error: jest.fn(),
    });
    realtimeNoteStore = Mock.of<RealtimeNoteStore>({
      find: jest.fn(),
      create: jest.fn(),
      getAllRealtimeNotes: jest.fn(),
    });

    mockedNoteConfig = Mock.of<NoteConfig>({ persistInterval: 0 });
    mockedPermissionService = Mock.of<PermissionService>({
      determinePermission: async (userId: number): Promise<PermissionLevel> => {
        if (userId === readWriteUserId) {
          return PermissionLevel.WRITE;
        } else if (userId === onlyReadUserId) {
          return PermissionLevel.READ;
        } else {
          return PermissionLevel.DENY;
        }
      },
    });

    const schedulerRegistry = Mock.of<SchedulerRegistry>({
      addInterval: jest.fn(),
      deleteInterval: jest.fn(),
    });

    addIntervalSpy = jest.spyOn(schedulerRegistry, 'addInterval');
    deleteIntervalSpy = jest.spyOn(schedulerRegistry, 'deleteInterval');
    setIntervalSpy = jest.spyOn(global, 'setInterval');
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    clientWithReadWrite = new MockConnectionBuilder(realtimeNote)
      .withAcceptingRealtimeUserStatus()
      .withLoggedInUser(readWriteUserId)
      .build();

    clientWithRead = new MockConnectionBuilder(realtimeNote)
      .withDecliningRealtimeUserStatus()
      .withLoggedInUser(onlyReadUserId)
      .build();

    clientWithoutReadWrite = new MockConnectionBuilder(realtimeNote)
      .withDecliningRealtimeUserStatus()
      .withGuestUser(noAccessUserId)
      .build();

    realtimeNoteService = new RealtimeNoteService(
      revisionsService,
      consoleLoggerService,
      realtimeNoteStore,
      schedulerRegistry,
      mockedNoteConfig,
      mockedPermissionService,
    );
  });

  describe('handleNotePermissionChanged', () => {
    beforeEach(() => {
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => {
        return realtimeNote;
      });
    });
    it('should not remove the connection with read and write access', async () => {
      const loggedUserTransporter = clientWithReadWrite.getTransporter();

      jest.spyOn(loggedUserTransporter, 'disconnect');

      await realtimeNoteService.handleNotePermissionChanged(mockedNoteId);

      expect(loggedUserTransporter.disconnect).toHaveBeenCalledTimes(0);
    });

    it('should close the connection for removed connection', async () => {
      const guestUserTransporter = clientWithoutReadWrite.getTransporter();
      jest.spyOn(guestUserTransporter, 'disconnect');

      await realtimeNoteService.handleNotePermissionChanged(mockedNoteId);

      expect(guestUserTransporter.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should change acceptEdits to true', async () => {
      await realtimeNoteService.handleNotePermissionChanged(mockedNoteId);
      expect(clientWithReadWrite.acceptEdits).toBeTruthy();
    });
    it('should change acceptEdits to false', async () => {
      clientWithRead.acceptEdits = true;
      await realtimeNoteService.handleNotePermissionChanged(mockedNoteId);
      expect(clientWithRead.acceptEdits).toBeFalsy();
    });
  });

  it("creates a new realtime note if it doesn't exist yet", async () => {
    mockGetLatestRevision(true, false);
    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest.spyOn(realtimeNoteStore, 'create').mockImplementation(() => realtimeNote);
    mockedNoteConfig.persistInterval = 0;

    await expect(realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId)).resolves.toBe(
      realtimeNote,
    );

    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
    expect(realtimeNoteStore.create).toHaveBeenCalledWith(mockedNoteId, mockedContent, undefined);
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("creates a new realtime note with a yjs state if it doesn't exist yet", async () => {
    mockGetLatestRevision(true, true);
    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest.spyOn(realtimeNoteStore, 'create').mockImplementation(() => realtimeNote);
    mockedNoteConfig.persistInterval = 0;

    await expect(realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId)).resolves.toBe(
      realtimeNote,
    );

    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
    expect(realtimeNoteStore.create).toHaveBeenCalledWith(
      mockedNoteId,
      mockedContent,
      mockedYjsStateBuffer,
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  describe('handleNoteAliasesChanged', () => {
    let spyRealtimeNoteStoreFind: jest.SpyInstance;
    let spyAnnounceAliasesUpdate: jest.SpyInstance;

    beforeEach(() => {
      spyRealtimeNoteStoreFind = jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => {
        return realtimeNote;
      });
      spyAnnounceAliasesUpdate = jest
        .spyOn(realtimeNote, 'announceAliasesUpdate')
        .mockImplementation(() => {});
    });

    it('announces change without new alias', async () => {
      await realtimeNoteService.handleNoteAliasesChanged(mockedNoteId);
      expect(spyRealtimeNoteStoreFind).toHaveBeenCalledWith(mockedNoteId);
      expect(spyAnnounceAliasesUpdate).toHaveBeenCalledWith(undefined);
    });

    it('announces change with new alias', async () => {
      await realtimeNoteService.handleNoteAliasesChanged(mockedNoteId, mockedAlias);
      expect(spyRealtimeNoteStoreFind).toHaveBeenCalledWith(mockedNoteId);
      expect(spyAnnounceAliasesUpdate).toHaveBeenCalledWith(mockedAlias);
    });
  });

  describe('with periodic timer', () => {
    it('starts a timer if config has set an interval', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest.spyOn(realtimeNoteStore, 'create').mockImplementation(() => realtimeNote);
      mockedNoteConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId);

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000 * 60 * 10);
      expect(addIntervalSpy).toHaveBeenCalled();
    });

    it('stops the timer if the realtime note gets destroyed', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest.spyOn(realtimeNoteStore, 'create').mockImplementation(() => realtimeNote);
      mockedNoteConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId);
      realtimeNote.emit('destroy');
      expect(deleteIntervalSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  it("fails if the requested note doesn't exist", async () => {
    mockGetLatestRevision(false);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);

    await expect(realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId)).rejects.toBe(
      `Revision for note mockedNoteId not found.`,
    );
    expect(realtimeNoteStore.create).not.toHaveBeenCalled();
    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
  });

  it("doesn't create a new realtime note if there is already one", async () => {
    mockGetLatestRevision(true);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest.spyOn(realtimeNoteStore, 'create').mockImplementation(() => realtimeNote);

    await expect(realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId)).resolves.toBe(
      realtimeNote,
    );

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => realtimeNote);

    await expect(realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId)).resolves.toBe(
      realtimeNote,
    );
    expect(realtimeNoteStore.create).toHaveBeenCalledTimes(1);
  });

  it('saves a realtime note if it gets destroyed', async () => {
    mockGetLatestRevision(true);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest.spyOn(realtimeNoteStore, 'create').mockImplementation(() => realtimeNote);

    await realtimeNoteService.getOrCreateRealtimeNote(mockedNoteId);

    const createRevisionSpy = jest.spyOn(revisionsService, 'createRevision').mockResolvedValue();

    realtimeNote.emit('beforeDestroy');
    expect(createRevisionSpy).toHaveBeenCalledWith(
      mockedNoteId,
      mockedContent,
      false, // this cannot be an initial revision, since this is created during note creation
      undefined, // the test doesn't use knex transactions
      mockedYjsStateBuffer,
    );
  });

  it('destroys every realtime note on application shutdown', () => {
    jest.spyOn(realtimeNoteStore, 'getAllRealtimeNotes').mockReturnValue([realtimeNote]);

    const destroySpy = jest.spyOn(realtimeNote, 'destroy');

    realtimeNoteService.beforeApplicationShutdown();

    expect(destroySpy).toHaveBeenCalled();
  });
});
