/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Column, Entity, ManyToOne } from 'typeorm/index';
import { Group } from '../groups/group.entity';
import { Note } from '../notes/note.entity';

@Entity()
export class NoteGroupPermission {
  @ManyToOne(_ => Group, { primary: true })
  group: Group;

  @ManyToOne(
    _ => Note,
    note => note.groupPermissions,
    { primary: true },
  )
  note: Note;

  @Column()
  canEdit: boolean;
}
