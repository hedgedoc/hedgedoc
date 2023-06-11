/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { HistoryEntry } from '../history/history-entry.entity';
import { MediaUpload } from '../media/media-upload.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Revision } from '../revisions/revision.entity';
import { User } from '../users/user.entity';
import { Alias } from './alias.entity';
import { generatePublicId } from './utils';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  publicId: string;

  @OneToMany(
    (_) => Alias,
    (alias) => alias.note,
    { cascade: true }, // This ensures that embedded Aliases are automatically saved to the database
  )
  aliases: Promise<Alias[]>;

  @OneToMany(
    (_) => NoteGroupPermission,
    (groupPermission) => groupPermission.note,
    { cascade: true }, // This ensures that embedded NoteGroupPermissions are automatically saved to the database
  )
  groupPermissions: Promise<NoteGroupPermission[]>;

  @OneToMany(
    (_) => NoteUserPermission,
    (userPermission) => userPermission.note,
    { cascade: true }, // This ensures that embedded NoteUserPermission are automatically saved to the database
  )
  userPermissions: Promise<NoteUserPermission[]>;

  @Column({
    nullable: false,
    default: 0,
  })
  viewCount: number;

  @ManyToOne((_) => User, (user) => user.ownedNotes, {
    onDelete: 'CASCADE', // This deletes the Note, when the associated User is deleted
    nullable: true,
  })
  owner: Promise<User | null>;

  @OneToMany((_) => Revision, (revision) => revision.note, { cascade: true })
  revisions: Promise<Revision[]>;

  @OneToMany((_) => HistoryEntry, (historyEntry) => historyEntry.user)
  historyEntries: Promise<HistoryEntry[]>;

  @OneToMany((_) => MediaUpload, (mediaUpload) => mediaUpload.note)
  mediaUploads: Promise<MediaUpload[]>;

  @Column({
    default: 2,
  })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Creates a new Note
   * @param owner The owner of the note
   * @param alias Optional primary alias
   */
  public static create(
    owner: User | null,
    alias?: string,
  ): Omit<Note, 'id' | 'createdAt'> {
    const newNote = new Note();
    newNote.publicId = generatePublicId();
    newNote.aliases = alias
      ? Promise.resolve([Alias.create(alias, newNote, true) as Alias])
      : Promise.resolve([]);
    newNote.userPermissions = Promise.resolve([]);
    newNote.groupPermissions = Promise.resolve([]);
    newNote.viewCount = 0;
    newNote.owner = Promise.resolve(owner);
    newNote.revisions = Promise.resolve([]);
    newNote.historyEntries = Promise.resolve([]);
    newNote.mediaUploads = Promise.resolve([]);
    newNote.version = 2;
    return newNote;
  }
}
