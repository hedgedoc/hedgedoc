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

import { User } from '../users/user.entity';

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  keyId: string;

  @ManyToOne((_) => User, (user) => user.authTokens, {
    onDelete: 'CASCADE', // This deletes the AuthToken, when the associated User is deleted
  })
  user: Promise<User>;

  @Column()
  label: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ unique: true })
  accessTokenHash: string;

  @Column()
  validUntil: Date;

  @Column({
    nullable: true,
    type: 'date',
  })
  lastUsed: Date | null;

  public static create(
    keyId: string,
    user: User,
    label: string,
    accessToken: string,
    validUntil: Date,
  ): Omit<AuthToken, 'id' | 'createdAt'> {
    const newToken = new AuthToken();
    newToken.keyId = keyId;
    newToken.user = Promise.resolve(user);
    newToken.label = label;
    newToken.accessTokenHash = accessToken;
    newToken.validUntil = validUntil;
    newToken.lastUsed = null;
    return newToken;
  }
}
