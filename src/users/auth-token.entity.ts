/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Type } from 'class-transformer';

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => User, (user) => user.authTokens)
  user: User;

  @Column()
  identifier: string;

  @Type(() => Date)
  @Column('text')
  createdAt: Date;

  @Column()
  accessToken: string;

  public static create(
    user: User,
    identifier: string,
    accessToken: string,
  ): Pick<AuthToken, 'user' | 'accessToken'> {
    const newToken = new AuthToken();
    newToken.user = user;
    newToken.identifier = identifier;
    newToken.accessToken = accessToken;
    newToken.createdAt = new Date();
    return newToken;
  }
}
