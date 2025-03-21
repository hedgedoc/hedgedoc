/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiToken } from '../api-token/api-token.entity';
import { Identity } from '../auth/identity.entity';
import { Author } from '../authors/author.entity';
import { Group } from '../groups/group.entity';
import { HistoryEntry } from '../history/history-entry.entity';
import { MediaUpload } from '../media/media-upload.entity';
import { Note } from '../notes/note.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  username: string;

  @Column()
  displayName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true,
    type: 'text',
  })
  photo: string | null;

  @Column({
    nullable: true,
    type: 'text',
  })
  email: string | null;

  @OneToMany((_) => Note, (note) => note.owner)
  ownedNotes: Promise<Note[]>;

  @OneToMany((_) => ApiToken, (apiToken) => apiToken.user)
  apiTokens: Promise<ApiToken[]>;

  @OneToMany((_) => Identity, (identity) => identity.user)
  identities: Promise<Identity[]>;

  @ManyToMany((_) => Group, (group) => group.members)
  groups: Promise<Group[]>;

  @OneToMany((_) => HistoryEntry, (historyEntry) => historyEntry.user)
  historyEntries: Promise<HistoryEntry[]>;

  @OneToMany((_) => MediaUpload, (mediaUpload) => mediaUpload.user)
  mediaUploads: Promise<MediaUpload[]>;

  @OneToMany(() => Author, (author) => author.user)
  authors: Promise<Author[]>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    username: string,
    displayName: string,
    email?: string,
    photoUrl?: string,
  ): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    const newUser = new User();
    newUser.username = username;
    newUser.displayName = displayName;
    newUser.photo = photoUrl ?? null;
    newUser.email = email ?? null;
    newUser.ownedNotes = Promise.resolve([]);
    newUser.apiTokens = Promise.resolve([]);
    newUser.identities = Promise.resolve([]);
    newUser.groups = Promise.resolve([]);
    newUser.historyEntries = Promise.resolve([]);
    newUser.mediaUploads = Promise.resolve([]);
    newUser.authors = Promise.resolve([]);
    return newUser;
  }
}
