/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';

import { RealtimeNote } from './realtime-note';

/**
 * A store for {@link RealtimeNote} instances that are linked to a specific note.
 * It allows creating, finding, and retrieving all realtime notes.
 */
@Injectable()
export class RealtimeNoteStore {
  private noteIdToRealtimeNote = new Map<number, RealtimeNote>();

  /**
   * Creates a new {@link RealtimeNote} for the given note and memorizes it
   *
   * @param noteId The id of the note for which the realtime note should be created
   * @param initialTextContent the initial text content of realtime doc
   * @param initialYjsState the initial yjs state. If provided this will be used instead of the text content
   * @throws Error if there is already a realtime note for the given note.
   * @returns The created realtime note
   */
  public create(
    noteId: number,
    initialTextContent: string,
    initialYjsState?: ArrayBuffer,
  ): RealtimeNote {
    if (this.noteIdToRealtimeNote.has(noteId)) {
      throw new Error(`Realtime note for note ${noteId} already exists.`);
    }
    const realtimeNote = new RealtimeNote(
      noteId,
      initialTextContent,
      initialYjsState ? Array.from(new Uint8Array(initialYjsState)) : undefined,
    );
    realtimeNote.on('destroy', () => {
      this.noteIdToRealtimeNote.delete(noteId);
    });
    this.noteIdToRealtimeNote.set(noteId, realtimeNote);
    return realtimeNote;
  }

  /**
   * Retrieves a {@link RealtimeNote} that is linked to the given note id
   *
   * @param noteId The id of the note
   * @returns A {@link RealtimeNote} or undefined if no instance is existing
   */
  public find(noteId: number): RealtimeNote | undefined {
    return this.noteIdToRealtimeNote.get(noteId);
  }

  /**
   * Returns all registered {@link RealtimeNote realtime notes}
   *
   * @returns An array of all realtime notes
   */
  public getAllRealtimeNotes(): RealtimeNote[] {
    return [...this.noteIdToRealtimeNote.values()];
  }
}
