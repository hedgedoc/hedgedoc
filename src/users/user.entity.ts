/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Column, OneToMany } from 'typeorm/index';
import { Note } from '../notes/note.entity';
import { AuthToken } from './auth-token.entity';
import { Identity } from './identity.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  displayName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true,
  })
  photo?: string;

  @Column({
    nullable: true,
  })
  email?: string;

  @OneToMany(
    _ => Note,
    note => note.owner,
  )
  ownedNotes: Note[];

  @OneToMany(
    _ => AuthToken,
    authToken => authToken.user,
  )
  authToken: AuthToken[];

  @OneToMany(
    _ => Identity,
    identity => identity.user,
  )
  identities: Identity[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    userName: string,
    displayName: string,
  ): Pick<
    User,
    'userName' | 'displayName' | 'ownedNotes' | 'authToken' | 'identities'
  > {
    const newUser = new User();
    newUser.userName = userName;
    newUser.displayName = displayName;
    return newUser;
  }
}
