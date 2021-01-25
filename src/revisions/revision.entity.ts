/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinTable, ManyToMany } from 'typeorm';
import { Note } from '../notes/note.entity';
import { Authorship } from './authorship.entity';

/**
 * The state of a note at a particular point in time,
 * with the content at that time and the diff to the previous revision.
 *
 */
@Entity()
export class Revision {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The patch from the previous revision to this one.
   */
  @Column({
    type: 'text',
  })
  patch: string;

  /**
   * The note content at this revision.
   */
  @Column({
    type: 'text',
  })
  content: string;

  /**
   * The length of the note content.
   */
  @Column()
  length: number;

  /**
   * Date at which the revision was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Note this revision belongs to.
   */
  @ManyToOne((_) => Note, (note) => note.revisions, { onDelete: 'CASCADE' })
  note: Note;
  /**
   * All authorship objects which are used in the revision.
   */
  @ManyToMany((_) => Authorship, (authorship) => authorship.revisions)
  @JoinTable()
  authorships: Authorship[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static create(content: string, patch: string): Revision {
    const newRevision = new Revision();
    newRevision.patch = patch;
    newRevision.content = content;
    newRevision.length = content.length;
    return newRevision;
  }
}
