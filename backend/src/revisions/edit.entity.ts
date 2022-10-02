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
 * The Edit represents a change in the content of a note by a particular {@link Author}
 */
@Entity()
export class Edit {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Revisions this edit appears in
   */
  @ManyToMany((_) => Revision, (revision) => revision.edits)
  revisions: Promise<Revision[]>;

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
  ): Omit<Edit, 'id' | 'createdAt' | 'updatedAt'> {
    const newEdit = new Edit();
    newEdit.revisions = Promise.resolve([]);
    newEdit.author = Promise.resolve(author);
    newEdit.startPos = startPos;
    newEdit.endPos = endPos;
    return newEdit;
  }
}
