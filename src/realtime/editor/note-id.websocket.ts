/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import WebSocket from 'ws';

export class NoteIdWebsocket extends WebSocket {
  private noteId: string;

  public getNoteId(): string {
    return this.noteId;
  }

  public setNoteId(noteId: string): void {
    this.noteId = noteId;
  }
}
