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
  lastUsedAt: Date | null;

  public static create(
    keyId: string,
    user: User,
    label: string,
    tokenString: string,
    validUntil: Date,
  ): Omit<AuthToken, 'id' | 'createdAt'> {
    const token = new AuthToken();
    token.keyId = keyId;
    token.user = Promise.resolve(user);
    token.label = label;
    token.accessTokenHash = tokenString;
    token.validUntil = validUntil;
    token.lastUsedAt = null;
    return token;
  }
}
