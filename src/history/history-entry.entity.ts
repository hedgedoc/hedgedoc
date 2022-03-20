/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

@Entity()
export class HistoryEntry {
  /**
   * The `user` and `note` properties cannot be converted to promises
   * (to lazy-load them), as TypeORM gets confused about lazy composite
   * primary keys.
   * See https://github.com/typeorm/typeorm/issues/6908
   */
  @PrimaryColumn()
  userId: string;

  @ManyToOne((_) => User, (user) => user.historyEntries, {
    onDelete: 'CASCADE',
  })
  user: User;

  @PrimaryColumn()
  noteId: string;

  @ManyToOne((_) => Note, (note) => note.historyEntries, {
    onDelete: 'CASCADE',
  })
  note: Note;

  @Column()
  pinStatus: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Create a history entry
   * @param user the user the history entry is associated with
   * @param note the note the history entry is associated with
   * @param [pinStatus=false] if the history entry should be pinned
   */
  public static create(
    user: User,
    note: Note,
    pinStatus = false,
  ): Omit<HistoryEntry, 'updatedAt'> {
    const newHistoryEntry = new HistoryEntry();
    newHistoryEntry.user = user;
    newHistoryEntry.note = note;
    newHistoryEntry.pinStatus = pinStatus;
    return newHistoryEntry;
  }
}
