/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';

import { Note } from '../../notes/note.entity';
import { RealtimeNote } from './realtime-note';

@Injectable()
export class RealtimeNoteStore {
  private noteIdToRealtimeNote = new Map<string, RealtimeNote>();

  /**
   * Creates a new {@link RealtimeNote} for the given {@link Note} and memorizes it.
   *
   * @param note The note for which the realtime note should be created
   * @param initialContent The initial content for the realtime note
   * @throws Error if there is already an realtime note for the given note.
   * @return The created realtime note
   */
  public create(note: Note, initialContent: string): RealtimeNote {
    if (this.noteIdToRealtimeNote.has(note.id)) {
      throw new Error(`Realtime note for note ${note.id} already exists.`);
    }
    const realtimeNote = new RealtimeNote(note, initialContent);
    realtimeNote.on('destroy', () => {
      this.noteIdToRealtimeNote.delete(note.id);
    });
    this.noteIdToRealtimeNote.set(note.id, realtimeNote);
    return realtimeNote;
  }

  /**
   * Retrieves a {@link RealtimeNote} that is linked to the given {@link Note} id.
   * @param noteId The id of the {@link Note}
   * @return A {@link RealtimeNote} or {@code undefined} if no instance is existing.
   */
  public find(noteId: string): RealtimeNote | undefined {
    return this.noteIdToRealtimeNote.get(noteId);
  }

  /**
   * Returns all registered {@link RealtimeNote realtime notes}.
   */
  public getAllRealtimeNotes(): RealtimeNote[] {
    return [...this.noteIdToRealtimeNote.values()];
  }
}
