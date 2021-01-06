/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm/index';
import { User } from '../users/user.entity';
import { Revision } from './revision.entity';

/**
 * This class stores which parts of a revision were edited by a particular user.
 */
@Entity()
export class Authorship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Revisions this authorship appears in
   */
  @ManyToMany(
    _ => Revision,
    revision => revision.authorships,
  )
  revisions: Revision[];

  /**
   * User this authorship represents
   */
  @ManyToOne(_ => User)
  user: User;

  @Column()
  startPos: number;

  @Column()
  endPos: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
