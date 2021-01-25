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
  @ManyToOne((_) => User, { primary: true })
  user: User;

  @ManyToOne((_) => Note, (note) => note.userPermissions, { primary: true })
  note: Note;

  @Column()
  canEdit: boolean;
}
