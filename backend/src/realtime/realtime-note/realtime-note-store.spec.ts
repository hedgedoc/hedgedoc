/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { SpyInstance } from 'jest-mock';
import * as realtimeNoteModule from './realtime-note';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteStore } from './realtime-note-store';

describe('RealtimeNoteStore', () => {
  let realtimeNoteStore: RealtimeNoteStore;
  let mockedRealtimeNote: RealtimeNote;
  let realtimeNoteConstructorSpy: SpyInstance<
    (noteId: number, initialTextContent: string, initialYjsState?: number[]) => RealtimeNote
  >;
  const mockedContent = 'mockedContent';
  const mockedNoteId = 4711;

  beforeEach(async () => {
    realtimeNoteStore = new RealtimeNoteStore();

    mockedRealtimeNote = new RealtimeNote(mockedNoteId, '');
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
    expect(realtimeNoteStore.create(mockedNoteId, mockedContent)).toBe(mockedRealtimeNote);
    expect(realtimeNoteConstructorSpy).toHaveBeenCalledWith(mockedNoteId, mockedContent, undefined);
    expect(realtimeNoteStore.find(mockedNoteId)).toBe(mockedRealtimeNote);
    expect(realtimeNoteStore.getAllRealtimeNotes()).toStrictEqual([mockedRealtimeNote]);
  });

  it("can create a new realtime note with a yjs state if it doesn't exist yet", () => {
    const initialYjsState = [0];
    expect(
      realtimeNoteStore.create(mockedNoteId, mockedContent, new Uint8Array(initialYjsState)),
    ).toBe(mockedRealtimeNote);
    expect(realtimeNoteConstructorSpy).toHaveBeenCalledWith(
      mockedNoteId,
      mockedContent,
      initialYjsState,
    );
    expect(realtimeNoteStore.find(mockedNoteId)).toBe(mockedRealtimeNote);
    expect(realtimeNoteStore.getAllRealtimeNotes()).toStrictEqual([mockedRealtimeNote]);
  });

  it('throws if a realtime note has already been created for the given note', () => {
    expect(realtimeNoteStore.create(mockedNoteId, mockedContent)).toBe(mockedRealtimeNote);
    expect(() => realtimeNoteStore.create(mockedNoteId, mockedContent)).toThrow(
      'Realtime note for note',
    );
  });

  it('deletes a note if it gets destroyed', () => {
    expect(realtimeNoteStore.create(mockedNoteId, mockedContent)).toBe(mockedRealtimeNote);
    mockedRealtimeNote.emit('destroy');
    expect(realtimeNoteStore.find(mockedNoteId)).toBe(undefined);
    expect(realtimeNoteStore.getAllRealtimeNotes()).toStrictEqual([]);
  });
});
