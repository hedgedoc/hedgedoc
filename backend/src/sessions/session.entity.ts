/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ISession } from 'connect-typeorm';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Author } from '../authors/author.entity';

@Entity()
export class Session implements ISession {
  @PrimaryColumn('varchar', { length: 255 })
  public id = '';

  @Index()
  @Column('bigint')
  public expiredAt = Date.now();

  @Column('text')
  public json = '';

  @DeleteDateColumn()
  public destroyedAt?: Date;

  @ManyToOne(() => Author, (author) => author.sessions)
  author: Promise<Author>;
}
