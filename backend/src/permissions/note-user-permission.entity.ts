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
} from 'typeorm';

import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

@Entity()
@Index(['user', 'note'], { unique: true })
export class NoteUserPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => User, {
    onDelete: 'CASCADE', // This deletes the NoteUserPermission, when the associated Note is deleted
    orphanedRowAction: 'delete', // This ensures the row of the NoteUserPermission is deleted when no user references it anymore
  })
  user: Promise<User>;

  @ManyToOne((_) => Note, (note) => note.userPermissions, {
    onDelete: 'CASCADE', // This deletes the NoteUserPermission, when the associated Note is deleted
    orphanedRowAction: 'delete', // This ensures the row of the NoteUserPermission is deleted when no note references it anymore
  })
  note: Promise<Note>;

  @Column()
  canEdit: boolean;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    user: User,
    note: Note,
    canEdit: boolean,
  ): NoteUserPermission {
    const userPermission = new NoteUserPermission();
    userPermission.user = Promise.resolve(user);
    userPermission.note = Promise.resolve(note);
    userPermission.canEdit = canEdit;
    return userPermission;
  }
}
