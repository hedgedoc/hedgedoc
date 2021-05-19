/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
} from 'typeorm';
import { Author } from '../authors/author.entity';
import { Revision } from './revision.entity';

/**
 * The Authorship represents a change in the content of a note by a particular {@link Author}
 */
@Entity()
export class Authorship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Revisions this authorship appears in
   */
  @ManyToMany((_) => Revision, (revision) => revision.authorships)
  revisions: Revision[];

  /**
   * Author that created the change
   */
  @ManyToOne(() => Author, (author) => author.authorships)
  author: Author;

  @Column()
  startPos: number;

  @Column()
  endPos: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(author: Author, startPos: number, endPos: number) {
    const newAuthorship = new Authorship();
    newAuthorship.author = author;
    newAuthorship.startPos = startPos;
    newAuthorship.endPos = endPos;
    return newAuthorship;
  }
}
