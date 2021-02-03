/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Column, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Note } from '../notes/note.entity';

@Entity()
export class HistoryEntry {
  @ManyToOne((_) => User, (user) => user.historyEntries, {
    onDelete: 'CASCADE',
    primary: true,
  })
  user: User;

  @ManyToOne((_) => Note, (note) => note.historyEntries, {
    onDelete: 'CASCADE',
    primary: true,
  })
  note: Note;

  @Column()
  pinStatus: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  // The optional note parameter is necessary for the createNote method in the NotesService,
  // as we create the note then and don't need to add it to the HistoryEntry.
  public static create(user: User, note?: Note): HistoryEntry {
    const newHistoryEntry = new HistoryEntry();
    newHistoryEntry.user = user;
    if (note) {
      newHistoryEntry.note = note;
    }
    newHistoryEntry.pinStatus = false;
    return newHistoryEntry;
  }
}
