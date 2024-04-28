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
  UpdateDateColumn,
} from 'typeorm';

import { Author } from '../authors/author.entity';
import { Revision } from './revision.entity';

/**
 * The RangeAuthorship represents a change in the content of a note by a particular {@link Author}
 */
@Entity()
export class RangeAuthorship {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Revisions this edit appears in
   */
  @ManyToOne((_) => Revision, (revision) => revision.rangeAuthorships)
  revision: Promise<Revision>;

  /**
   * Author that created the change
   */
  @ManyToOne(() => Author, (author) => author.edits)
  author: Promise<Author>;

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

  public static create(
    author: Author,
    startPos: number,
    endPos: number,
  ): Omit<RangeAuthorship, 'id' | 'createdAt' | 'updatedAt' | 'revision'> {
    const newEdit = new RangeAuthorship();
    newEdit.author = Promise.resolve(author);
    newEdit.startPos = startPos;
    newEdit.endPos = endPos;
    return newEdit;
  }
}
