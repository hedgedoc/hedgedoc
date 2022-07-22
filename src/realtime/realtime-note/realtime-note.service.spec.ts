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
import { Revision } from '../../revisions/revision.entity';
import { RevisionsService } from '../../revisions/revisions.service';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteStore } from './realtime-note-store.service';
import { RealtimeNoteService } from './realtime-note.service';
import { mockAwareness } from './test-utils/mock-awareness';
import { mockRealtimeNote } from './test-utils/mock-realtime-note';
import { mockWebsocketDoc } from './test-utils/mock-websocket-doc';
import { waitForOtherPromisesToFinish } from './test-utils/wait-for-other-promises-to-finish';
import { WebsocketDoc } from './websocket-doc';

describe('RealtimeNoteService', () => {
  const mockedContent = 'mockedContent';
  const mockedNoteId = 'mockedNoteId';
  let websocketDoc: WebsocketDoc;
  let mockedNote: Note;
  let mockedRealtimeNote: RealtimeNote;
  let realtimeNoteService: RealtimeNoteService;
  let revisionsService: RevisionsService;
  let realtimeNoteStore: RealtimeNoteStore;
  let consoleLoggerService: ConsoleLoggerService;
  let mockedAppConfig: AppConfig;
  let addIntervalSpy: jest.SpyInstance;
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;
  let deleteIntervalSpy: jest.SpyInstance;

  function mockGetLatestRevision(latestRevisionExists: boolean) {
    jest
      .spyOn(revisionsService, 'getLatestRevision')
      .mockImplementation((note: Note) =>
        note === mockedNote && latestRevisionExists
          ? Promise.resolve(
              Mock.of<Revision>({
                content: mockedContent,
              }),
            )
          : Promise.reject('Revision for note mockedNoteId not found.'),
      );
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    websocketDoc = mockWebsocketDoc();
    mockedNote = Mock.of<Note>({ id: mockedNoteId });
    mockedRealtimeNote = mockRealtimeNote(
      mockedNote,
      websocketDoc,
      mockAwareness(),
    );

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

    mockedAppConfig = Mock.of<AppConfig>({ persistInterval: 0 });

    const schedulerRegistry = Mock.of<SchedulerRegistry>({
      addInterval: jest.fn(),
      deleteInterval: jest.fn(),
    });

    addIntervalSpy = jest.spyOn(schedulerRegistry, 'addInterval');
    deleteIntervalSpy = jest.spyOn(schedulerRegistry, 'deleteInterval');
    setIntervalSpy = jest.spyOn(global, 'setInterval');
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    realtimeNoteService = new RealtimeNoteService(
      revisionsService,
      consoleLoggerService,
      realtimeNoteStore,
      schedulerRegistry,
      mockedAppConfig,
    );
  });

  it("creates a new realtime note if it doesn't exist yet", async () => {
    mockGetLatestRevision(true);
    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => mockedRealtimeNote);
    mockedAppConfig.persistInterval = 0;

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).resolves.toBe(mockedRealtimeNote);

    expect(realtimeNoteStore.find).toBeCalledWith(mockedNoteId);
    expect(realtimeNoteStore.create).toBeCalledWith(mockedNote, mockedContent);
    expect(setIntervalSpy).not.toBeCalled();
  });

  describe('with periodic timer', () => {
    it('starts a timer if config has set an interval', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest
        .spyOn(realtimeNoteStore, 'create')
        .mockImplementation(() => mockedRealtimeNote);
      mockedAppConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(mockedNote);

      expect(setIntervalSpy).toBeCalledWith(
        expect.any(Function),
        1000 * 60 * 10,
      );
      expect(addIntervalSpy).toBeCalled();
    });

    it('stops the timer if the realtime note gets destroyed', async () => {
      mockGetLatestRevision(true);
      jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
      jest
        .spyOn(realtimeNoteStore, 'create')
        .mockImplementation(() => mockedRealtimeNote);
      mockedAppConfig.persistInterval = 10;

      await realtimeNoteService.getOrCreateRealtimeNote(mockedNote);
      mockedRealtimeNote.emit('destroy');
      expect(deleteIntervalSpy).toBeCalled();
      expect(clearIntervalSpy).toBeCalled();
    });
  });

  it("fails if the requested note doesn't exist", async () => {
    mockGetLatestRevision(false);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).rejects.toBe(`Revision for note mockedNoteId not found.`);
    expect(realtimeNoteStore.create).not.toBeCalled();
    expect(realtimeNoteStore.find).toBeCalledWith(mockedNoteId);
  });

  it("doesn't create a new realtime note if there is already one", async () => {
    mockGetLatestRevision(true);

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => mockedRealtimeNote);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).resolves.toBe(mockedRealtimeNote);

    jest
      .spyOn(realtimeNoteStore, 'find')
      .mockImplementation(() => mockedRealtimeNote);

    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).resolves.toBe(mockedRealtimeNote);
    expect(realtimeNoteStore.create).toBeCalledTimes(1);
  });

  it('saves a realtime note if it gets destroyed', async () => {
    mockGetLatestRevision(true);
    const mockedCurrentContent = 'mockedCurrentContent';

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => mockedRealtimeNote);
    jest
      .spyOn(websocketDoc, 'getCurrentContent')
      .mockReturnValue(mockedCurrentContent);

    await realtimeNoteService.getOrCreateRealtimeNote(mockedNote);

    const createRevisionSpy = jest
      .spyOn(revisionsService, 'createRevision')
      .mockImplementation(() => Promise.resolve(Mock.of<Revision>()));

    mockedRealtimeNote.emit('beforeDestroy');
    expect(createRevisionSpy).toBeCalledWith(mockedNote, mockedCurrentContent);
  });

  it('logs errors that occur during saving on destroy', async () => {
    mockGetLatestRevision(true);
    const mockedCurrentContent = 'mockedCurrentContent';

    jest.spyOn(realtimeNoteStore, 'find').mockImplementation(() => undefined);
    jest
      .spyOn(realtimeNoteStore, 'create')
      .mockImplementation(() => mockedRealtimeNote);
    jest
      .spyOn(websocketDoc, 'getCurrentContent')
      .mockReturnValue(mockedCurrentContent);
    jest
      .spyOn(revisionsService, 'createRevision')
      .mockImplementation(() => Promise.reject('mocked error'));

    const logSpy = jest.spyOn(consoleLoggerService, 'error');

    await realtimeNoteService.getOrCreateRealtimeNote(mockedNote);
    mockedRealtimeNote.emit('beforeDestroy');

    await waitForOtherPromisesToFinish();
    expect(logSpy).toBeCalled();
  });

  it('destroys every realtime note on application shutdown', () => {
    jest
      .spyOn(realtimeNoteStore, 'getAllRealtimeNotes')
      .mockReturnValue([mockedRealtimeNote]);

    const destroySpy = jest.spyOn(mockedRealtimeNote, 'destroy');

    realtimeNoteService.beforeApplicationShutdown();

    expect(destroySpy).toBeCalled();
  });
});
