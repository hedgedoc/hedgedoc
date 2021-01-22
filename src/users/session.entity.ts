/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ISession } from 'connect-typeorm';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class Session implements ISession {
  @PrimaryColumn('varchar', { length: 255 })
  public id = '';

  @Index()
  @Column('bigint')
  public expiredAt = Date.now();

  @Column('text')
  public json = '';
}
