/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SchedulerRegistry } from '@nestjs/schedule';
import { Mock } from 'ts-mockery';

import { AppConfig } from '../../config/app.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Note } from '../../notes/note.entity';
import { NotePermission } from '../../permissions/note-permission.enum';
import { PermissionsService } from '../../permissions/permissions.service';
import { Revision } from '../../revisions/revision.entity';
import { RevisionsService } from '../../revisions/revisions.service';
import { User } from '../../users/user.entity';
import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteStore } from './realtime-note-store';
import { RealtimeNoteService } from './realtime-note.service';
import { MockConnectionBuilder } from './test-utils/mock-connection';

describe('RealtimeNoteService', () => {
  const mockedContent = 'mockedContent';
  const mockedYjsState = [1, 2, 3];
  const mockedNoteId = 4711;
  let note: Note;
  let realtimeNote: RealtimeNote;
  let realtimeNoteService: RealtimeNoteService;
  let revisionsService: RevisionsService;
  let realtimeNoteStore: RealtimeNoteStore;
  let mockedPermissionService: PermissionsService;
  let consoleLoggerService: ConsoleLoggerService;
  let mockedAppConfig: AppConfig;
  let addIntervalSpy: jest.SpyInstance;
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;
  let clientWithReadWrite: RealtimeConnection;
  let clientWithRead: RealtimeConnection;
  let clientWithoutReadWrite: RealtimeConnection;
  let deleteIntervalSpy: jest.SpyInstance;

  const readWriteUsername = 'can-read-write-user';
  const onlyReadUsername = 'can-only-read-user';
  const noAccessUsername = 'no-read-write-user';

  afterAll(() => {
    jest.useRealTimers();
  });
  beforeAll(() => {
    jest.useFakeTimers();
  });

  function mockGetLatestRevision(
    latestRevisionExists: boolean,
    hasYjsState = false,
  ) {
    jest
      .spyOn(revisionsService, 'getLatestRevision')
      .mockImplementation((note: Note) =>
        note.id === mockedNoteId && latestRevisionExists
          ? Promise.resolve(
              Mock.of<Revision>({
                content: mockedContent,
                ...(hasYjsState ? { yjsStateVector: mockedYjsState } : {}),
              }),
            )
          : Promise.reject('Revision for note mockedNoteId not found.'),
      );
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    note = Mock.of<Note>({ id: mockedNoteId });
    realtimeNote = new RealtimeNote(note, mockedContent);

    revisionsService = Mock.of<RevisionsService>({
      getLatestRevision: jest.fn(),
      createAndSaveRevision: jest.fn(),
    });

    consoleLoggerService = Mock.of<ConsoleLoggerService>({
      error: jest.fn(),
    });
    realtimeNoteStore = Mock.of<RealtimeNoteStore>({
      find: jest.fn(),
      create: jest.fn(),
      getAllRealtimeNotes: jest.fn(),
    });

    mockedAppConfig = Mock.of<AppConfig>({ persistInterval: 0 });
    mockedPermissionService = Mock.of<PermissionsService>({
      determinePermission: async (user: User | null) => {
        if (user?.username === readWriteUsername) {
          return NotePermission.WRITE;
        } else if (user?.username === onlyReadUsername) {
          return NotePermission.READ;
        } else {
          return NotePermission.DENY;
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
      .withLoggedInUser(readWriteUsername)
      .build();

    clientWithRead = new MockConnectionBuilder(realtimeNote)
      .withDecliningRealtimeUserStatus()
      .withLoggedInUser(onlyReadUsername)
      .build();

    clientWithoutReadWrite = new MockConnectionBuilder(realtimeNote)
      .withDecliningRealtimeUserStatus()
      .withGuestUser(noAccessUsername)
      .build();

    realtimeNoteService = new RealtimeNoteService(
      revisionsService,
      consoleLoggerService,
      realtimeNoteStore,
      schedulerRegistry,
      mockedAppConfig,
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

      await realtimeNoteService.handleNotePermissionChanged(note);

      expect(loggedUserTransporter.disconnect).toHaveBeenCalledTimes(0);
    });

    it('should close the connection for removed connection', async () => {
      const guestUserTransporter = clientWithoutReadWrite.getTransporter();
      jest.spyOn(guestUserTransporter, 'disconnect');

      await realtimeNoteService.handleNotePermissionChanged(note);

      expect(guestUserTransporter.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should change acceptEdits to true', async () => {
      await realtimeNoteService.handleNotePermissionChanged(note);
      expect(clientWithReadWrite.acceptEdits).toBeTruthy();
    });
    it('should change acceptEdits to false', async () => {
      clientWithRead.acceptEdits = true;
      await realtimeNoteService.handleNotePermissionChanged(note);
      expect(clientWithRead.acceptEdits).toBeFalsy();
    });
  });

  it("creates a new realtime note if it doesn't exist yet", async () => {
    mockGetLatestRevision(true);
    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);
    mockedAppConfig.persistInterval = 0;

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);

    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
    expect(realtimeNoteStore.create).toHaveBeenCalledWith(
      note,
      mockedContent,
      undefined,
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it("creates a new realtime note with a yjs state if it doesn't exist yet", async () => {
    mockGetLatestRevision(true, true);
    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);
    mockedAppConfig.persistInterval = 0;

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);

    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
    expect(realtimeNoteStore.create).toHaveBeenCalledWith(
      note,
      mockedContent,
      mockedYjsState,
    );
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  describe('with periodic timer', () => {
    it('starts a timer if config has set an interval', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest
        .spyOn(realtimeNoteStore, 'create')
        .mockImplementation(() => realtimeNote);
      mockedAppConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(note);

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        1000 * 60 * 10,
      );
      expect(addIntervalSpy).toHaveBeenCalled();
    });

    it('stops the timer if the realtime note gets destroyed', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest
        .spyOn(realtimeNoteStore, 'create')
        .mockImplementation(() => realtimeNote);
      mockedAppConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(note);
      realtimeNote.emit('destroy');
      expect(deleteIntervalSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  it("fails if the requested note doesn't exist", async () => {
    mockGetLatestRevision(false);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).rejects.toBe(`Revision for note mockedNoteId not found.`);
    expect(realtimeNoteStore.create).not.toHaveBeenCalled();
    expect(realtimeNoteStore.find).toHaveBeenCalledWith(mockedNoteId);
  });

  it("doesn't create a new realtime note if there is already one", async () => {
    mockGetLatestRevision(true);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);

    jest
      .spyOn(realtimeNoteStore, 'find')
      .mockImplementation(() => realtimeNote);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(note),
    ).resolves.toBe(realtimeNote);
    expect(realtimeNoteStore.create).toHaveBeenCalledTimes(1);
  });

  it('saves a realtime note if it gets destroyed', async () => {
    mockGetLatestRevision(true);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => realtimeNote);

    await realtimeNoteService.getOrCreateRealtimeNote(note);

    const createRevisionSpy = jest
      .spyOn(revisionsService, 'createAndSaveRevision')
      .mockResolvedValue();

    realtimeNote.emit('beforeDestroy');
    expect(createRevisionSpy).toHaveBeenCalledWith(
      note,
      mockedContent,
      expect.any(Array),
    );
  });

  it('destroys every realtime note on application shutdown', () => {
    jest
      .spyOn(realtimeNoteStore, 'getAllRealtimeNotes')
      .mockReturnValue([realtimeNote]);

    const destroySpy = jest.spyOn(realtimeNote, 'destroy');

    realtimeNoteService.beforeApplicationShutdown();

    expect(destroySpy).toHaveBeenCalled();
  });
});
