/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';

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
}
