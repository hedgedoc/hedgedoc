/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
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
export class PublicAuthToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  keyId: string;

  @ManyToOne((_) => User, (user) => user.publicAuthTokens, {
    onDelete: 'CASCADE', // This deletes the PublicAuthToken, when the associated User is deleted
  })
  user: Promise<User>;

  @Column()
  label: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ unique: true })
  hash: string;

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
  ): Omit<PublicAuthToken, 'id' | 'createdAt'> {
    const token = new PublicAuthToken();
    token.keyId = keyId;
    token.user = Promise.resolve(user);
    token.label = label;
    token.hash = tokenString;
    token.validUntil = validUntil;
    token.lastUsedAt = null;
    return token;
  }
}
