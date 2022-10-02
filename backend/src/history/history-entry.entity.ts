/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

@Entity()
@Index(['note', 'user'], { unique: true })
export class HistoryEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => User, (user) => user.historyEntries, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete', // This ensures the row of the history entry is deleted when no user references it anymore
  })
  user: Promise<User>;

  @ManyToOne((_) => Note, (note) => note.historyEntries, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete', // This ensures the row of the history entry is deleted when no note references it anymore
  })
  note: Promise<Note>;

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
    newHistoryEntry.user = Promise.resolve(user);
    newHistoryEntry.note = Promise.resolve(note);
    newHistoryEntry.pinStatus = pinStatus;
    return newHistoryEntry;
  }
}
