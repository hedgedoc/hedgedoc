/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  displayName: string;

  /**
   * Is set to denote a special group
   * Special groups are used to map the old share settings like "everyone can edit"
   * or "logged in users can view" to the group permission system
   */
  @Column()
  special: boolean;

  @ManyToMany((_) => User, (user) => user.groups, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  members: User[];
}
