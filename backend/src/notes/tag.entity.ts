/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Revision } from '../revisions/revision.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @ManyToMany((_) => Revision, (revision) => revision.tags)
  revisions: Promise<Revision[]>;
}
