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
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  keyId: string;

  @ManyToOne((_) => User, (user) => user.authTokens)
  user: User;

  @Column()
  identifier: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ unique: true })
  accessToken: string;

  @Column({
    nullable: true,
  })
  validUntil: number;

  @Column({
    nullable: true,
  })
  lastUsed: number;

  public static create(
    user: User,
    identifier: string,
    keyId: string,
    accessToken: string,
    validUntil?: number,
  ): Pick<AuthToken, 'user' | 'accessToken'> {
    const newToken = new AuthToken();
    newToken.user = user;
    newToken.identifier = identifier;
    newToken.keyId = keyId;
    newToken.accessToken = accessToken;
    newToken.createdAt = new Date();
    if (validUntil !== undefined) {
      newToken.validUntil = validUntil;
    }
    return newToken;
  }
}
