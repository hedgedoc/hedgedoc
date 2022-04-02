/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import { Revision } from '../../revisions/revision.entity';
import { RevisionsService } from '../../revisions/revisions.service';
import * as realtimeNoteModule from './realtime-note';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteService } from './realtime-note.service';
import { mockRealtimeNote } from './test-utils/mock-realtime-note';
import { WebsocketAwareness } from './websocket-awareness';
import { WebsocketDoc } from './websocket-doc';

describe('RealtimeNoteService', () => {
  let realtimeNoteService: RealtimeNoteService;
  let mockedNote: Note;
  let mockedRealtimeNote: RealtimeNote;
  let realtimeNoteConstructorSpy: jest.SpyInstance;
  let revisionsService: RevisionsService;
  const mockedContent = 'mockedContent';
  const mockedNoteId = 'mockedNoteId';

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

    revisionsService = Mock.of<RevisionsService>({
      getLatestRevision: jest.fn(),
    });

    realtimeNoteService = new RealtimeNoteService(revisionsService);

    mockedNote = Mock.of<Note>({ id: mockedNoteId });
    mockedRealtimeNote = mockRealtimeNote(
      Mock.of<WebsocketDoc>(),
      Mock.of<WebsocketAwareness>(),
    );
    realtimeNoteConstructorSpy = jest
      .spyOn(realtimeNoteModule, 'RealtimeNote')
      .mockReturnValue(mockedRealtimeNote);
  });

  it("creates a new realtime note if it doesn't exist yet", async () => {
    mockGetLatestRevision(true);
    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).resolves.toBe(mockedRealtimeNote);
    expect(realtimeNoteConstructorSpy).toBeCalledWith(
      mockedNoteId,
      mockedContent,
    );
    expect(realtimeNoteService.getRealtimeNote(mockedNoteId)).toBe(
      mockedRealtimeNote,
    );
  });

  it("fails if the requested note doesn't exist", async () => {
    mockGetLatestRevision(false);
    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).rejects.toBe(`Revision for note mockedNoteId not found.`);
    expect(realtimeNoteConstructorSpy).not.toBeCalled();
    expect(realtimeNoteService.getRealtimeNote(mockedNoteId)).toBeUndefined();
  });

  it("doesn't create a new realtime note if there is already one", async () => {
    mockGetLatestRevision(true);
    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).resolves.toBe(mockedRealtimeNote);
    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).resolves.toBe(mockedRealtimeNote);
    expect(realtimeNoteConstructorSpy).toBeCalledTimes(1);
  });

  it('deletes the realtime from the map if the realtime note is destroyed', async () => {
    mockGetLatestRevision(true);
    await expect(
      realtimeNoteService.getOrCreateRealtimeNote(mockedNote),
    ).resolves.toBe(mockedRealtimeNote);
    mockedRealtimeNote.emit('destroy');
    expect(realtimeNoteService.getRealtimeNote(mockedNoteId)).toBeUndefined();
  });
});
