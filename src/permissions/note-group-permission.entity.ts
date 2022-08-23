/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
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

import { Group } from '../groups/group.entity';
import { Note } from '../notes/note.entity';

@Entity()
@Index(['group', 'note'], { unique: true })
export class NoteGroupPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => Group, {
    onDelete: 'CASCADE', // This deletes the NoteGroupPermission, when the associated Group is deleted
    orphanedRowAction: 'delete', // This ensures the row of the NoteGroupPermission is deleted when no group references it anymore
  })
  group: Promise<Group>;

  @ManyToOne((_) => Note, (note) => note.groupPermissions, {
    onDelete: 'CASCADE', // This deletes the NoteGroupPermission, when the associated Note is deleted
    orphanedRowAction: 'delete', // This ensures the row of the NoteGroupPermission is deleted when no note references it anymore
  })
  note: Promise<Note>;

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
    groupPermission.group = Promise.resolve(group);
    groupPermission.note = Promise.resolve(note);
    groupPermission.canEdit = canEdit;
    return groupPermission;
  }
}
