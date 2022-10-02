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
  })
  @JoinTable()
  members: Promise<User[]>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    name: string,
    displayName: string,
    special: boolean,
  ): Omit<Group, 'id'> {
    const newGroup = new Group();
    newGroup.name = name;
    newGroup.displayName = displayName;
    newGroup.special = special; // this attribute should only be true for the two special groups
    newGroup.members = Promise.resolve([]);
    return newGroup;
  }
}
