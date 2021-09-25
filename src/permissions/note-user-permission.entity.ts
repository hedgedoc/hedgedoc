/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Column, Entity, ManyToOne } from 'typeorm';

import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

@Entity()
export class NoteUserPermission {
  @ManyToOne((_) => User, {
    primary: true,
    onDelete: 'CASCADE', // This deletes the NoteUserPermission, when the associated Note is deleted
  })
  user: User;

  @ManyToOne((_) => Note, (note) => note.userPermissions, {
    primary: true,
    onDelete: 'CASCADE', // This deletes the NoteUserPermission, when the associated Note is deleted
  })
  note: Note;

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
    userPermission.user = user;
    userPermission.note = note;
    userPermission.canEdit = canEdit;
    return userPermission;
  }
}
