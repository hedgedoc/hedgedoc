/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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

import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import { Group } from '../groups/group.entity';
import { HistoryEntry } from '../history/history-entry.entity';
import { Identity } from '../identity/identity.entity';
import { MediaUpload } from '../media/media-upload.entity';
import { Note } from '../notes/note.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  userName: string;

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
  ownedNotes: Note[];

  @OneToMany((_) => AuthToken, (authToken) => authToken.user)
  authTokens: AuthToken[];

  @OneToMany((_) => Identity, (identity) => identity.user)
  identities: Promise<Identity[]>;

  @ManyToMany((_) => Group, (group) => group.members)
  groups: Group[];

  @OneToMany((_) => HistoryEntry, (historyEntry) => historyEntry.user)
  historyEntries: HistoryEntry[];

  @OneToMany((_) => MediaUpload, (mediaUpload) => mediaUpload.user)
  mediaUploads: MediaUpload[];

  @OneToMany(() => Author, (author) => author.user)
  authors: Author[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    userName: string,
    displayName: string,
  ): Pick<
    User,
    'userName' | 'displayName' | 'ownedNotes' | 'authTokens' | 'identities'
  > {
    const newUser = new User();
    newUser.userName = userName;
    newUser.displayName = displayName;
    return newUser;
  }
}
