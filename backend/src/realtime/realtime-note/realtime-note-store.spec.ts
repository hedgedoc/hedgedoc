/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { Note } from '../../notes/note.entity';
import * as realtimeNoteModule from './realtime-note';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteStore } from './realtime-note-store';

describe('RealtimeNoteStore', () => {
  let realtimeNoteStore: RealtimeNoteStore;
  let mockedNote: Note;
  let mockedRealtimeNote: RealtimeNote;
  let realtimeNoteConstructorSpy: jest.SpyInstance;
  const mockedContent = 'mockedContent';
  const mockedNoteId = 4711;

  beforeEach(async () => {
    realtimeNoteStore = new RealtimeNoteStore();

    mockedNote = Mock.of<Note>({ id: mockedNoteId });
    mockedRealtimeNote = new RealtimeNote(mockedNote, '');
    realtimeNoteConstructorSpy = jest
      .spyOn(realtimeNoteModule, 'RealtimeNote')
      .mockReturnValue(mockedRealtimeNote);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
  });

  it("can create a new realtime note if it doesn't exist yet", () => {
    expect(realtimeNoteStore.create(mockedNote, mockedContent)).toBe(
      mockedRealtimeNote,
    );
    expect(realtimeNoteConstructorSpy).toHaveBeenCalledWith(
      mockedNote,
      mockedContent,
      undefined,
    );
    expect(realtimeNoteStore.find(mockedNoteId)).toBe(mockedRealtimeNote);
    expect(realtimeNoteStore.getAllRealtimeNotes()).toStrictEqual([
      mockedRealtimeNote,
    ]);
  });

  it("can create a new realtime note with a yjs state if it doesn't exist yet", () => {
    const initialYjsState = [1, 2, 3];
    expect(
      realtimeNoteStore.create(mockedNote, mockedContent, initialYjsState),
    ).toBe(mockedRealtimeNote);
    expect(realtimeNoteConstructorSpy).toHaveBeenCalledWith(
      mockedNote,
      mockedContent,
      initialYjsState,
    );
    expect(realtimeNoteStore.find(mockedNoteId)).toBe(mockedRealtimeNote);
    expect(realtimeNoteStore.getAllRealtimeNotes()).toStrictEqual([
      mockedRealtimeNote,
    ]);
  });

  it('throws if a realtime note has already been created for the given note', () => {
    expect(realtimeNoteStore.create(mockedNote, mockedContent)).toBe(
      mockedRealtimeNote,
    );
    expect(() => realtimeNoteStore.create(mockedNote, mockedContent)).toThrow();
  });

  it('deletes a note if it gets destroyed', () => {
    expect(realtimeNoteStore.create(mockedNote, mockedContent)).toBe(
      mockedRealtimeNote,
    );
    mockedRealtimeNote.emit('destroy');
    expect(realtimeNoteStore.find(mockedNoteId)).toBe(undefined);
    expect(realtimeNoteStore.getAllRealtimeNotes()).toStrictEqual([]);
  });
});
