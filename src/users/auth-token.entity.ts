/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => User, (user) => user.authTokens)
  user: User;

  @Column()
  identifier: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ unique: true })
  accessToken: string;

  @Column({ type: 'date' })
  validUntil: Date;

  public static create(
    user: User,
    identifier: string,
    accessToken: string,
    validUntil: Date,
  ): Pick<AuthToken, 'user' | 'accessToken'> {
    const newToken = new AuthToken();
    newToken.user = user;
    newToken.identifier = identifier;
    newToken.accessToken = accessToken;
    newToken.createdAt = new Date();
    newToken.validUntil = validUntil;
    return newToken;
  }
}
