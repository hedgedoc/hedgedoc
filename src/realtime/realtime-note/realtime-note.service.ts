/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';

import { Note } from '../../notes/note.entity';
import { RevisionsService } from '../../revisions/revisions.service';
import { RealtimeNote } from './realtime-note';

@Injectable()
export class RealtimeNoteService {
  constructor(private revisionsService: RevisionsService) {}

  private noteIdToRealtimeNote = new Map<string, RealtimeNote>();

  /**
   * Creates or reuses a {@link RealtimeNote} that is handling the real time editing of the {@link Note} which is identified by the given note id.
   * @param note The for which a {@link RealtimeNote realtime note} should be retrieved.
   * @throws NotInDBError if note doesn't exist or has no revisions.
   * @return A {@link RealtimeNote} that is linked to the given note.
   */
  public async getOrCreateRealtimeNote(note: Note): Promise<RealtimeNote> {
    return (
      this.noteIdToRealtimeNote.get(note.id) ??
      (await this.createNewRealtimeNote(note))
    );
  }

  /**
   * Creates a new {@link RealtimeNote} for the given {@link Note} and memorizes it.
   *
   * @param note The note for which the realtime note should be created
   * @throws NotInDBError if note doesn't exist or has no revisions.
   * @return The created realtime note
   */
  private async createNewRealtimeNote(note: Note): Promise<RealtimeNote> {
    const initialContent = (await this.revisionsService.getLatestRevision(note))
      .content;
    const realtimeNote = new RealtimeNote(note.id, initialContent);
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
  public getRealtimeNote(noteId: string): RealtimeNote | undefined {
    return this.noteIdToRealtimeNote.get(noteId);
  }
}
