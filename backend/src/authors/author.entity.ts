/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RangeAuthorship } from '../revisions/range-authorship.entity';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';

export type AuthorColor = number;

/**
 * The author represents a single user editing a note.
 * A 'user' can either be a registered and logged-in user or a browser session identified by its cookie.
 * All edits of one user in a note must belong to the same author, so that the same color can be displayed.
 */
@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * The id of the color of this author
   * The application maps the id to an actual color
   */
  @Column({ type: 'int' })
  color: AuthorColor;

  /**
   * A list of (browser) sessions this author has
   * Only contains sessions for anonymous users, which don't have a user set
   */
  @OneToMany(() => Session, (session) => session.author)
  sessions: Promise<Session[]>;

  /**
   * User that this author corresponds to
   * Only set when the user was identified (by a browser session) as a registered user at edit-time
   */
  @ManyToOne(() => User, (user) => user.authors, { nullable: true })
  user: Promise<User | null>;

  /**
   * List of edits that this author created
   * All edits must belong to the same note
   */
  @OneToMany(() => RangeAuthorship, (edit) => edit.author)
  edits: Promise<RangeAuthorship[]>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(color: number): Omit<Author, 'id'> {
    const newAuthor = new Author();
    newAuthor.color = color;
    newAuthor.sessions = Promise.resolve([]);
    newAuthor.user = Promise.resolve(null);
    newAuthor.edits = Promise.resolve([]);
    return newAuthor;
  }
}
