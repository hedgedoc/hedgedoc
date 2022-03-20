/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { Group } from '../groups/group.entity';
import { Note } from '../notes/note.entity';

@Entity()
export class NoteGroupPermission {
  /**
   * The `group` and `note` properties cannot be converted to promises
   * (to lazy-load them), as TypeORM gets confused about lazy composite
   * primary keys.
   * See https://github.com/typeorm/typeorm/issues/6908
   */

  @PrimaryColumn()
  groupId: number;

  @ManyToOne((_) => Group, {
    onDelete: 'CASCADE', // This deletes the NoteGroupPermission, when the associated Group is deleted
  })
  group: Group;

  @PrimaryColumn()
  noteId: string;

  @ManyToOne((_) => Note, (note) => note.groupPermissions, {
    onDelete: 'CASCADE', // This deletes the NoteGroupPermission, when the associated Note is deleted
  })
  note: Note;

  @Column()
  canEdit: boolean;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    group: Group,
    note: Note,
    canEdit: boolean,
  ): NoteGroupPermission {
    const groupPermission = new NoteGroupPermission();
    groupPermission.group = group;
    groupPermission.note = note;
    groupPermission.canEdit = canEdit;
    return groupPermission;
  }
}
