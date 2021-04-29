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
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((_) => User, (user) => user.identities, {
    onDelete: 'CASCADE', // This deletes the Identity, when the associated User is deleted
  })
  user: User;

  @Column()
  providerName: string;

  @Column()
  syncSource: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true,
  })
  providerUserId: string | null;

  @Column({
    nullable: true,
  })
  oAuthAccessToken: string | null;

  @Column({
    nullable: true,
  })
  passwordHash: string | null;
}
