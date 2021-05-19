/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
import { Authorship } from '../revisions/authorship.entity';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';

export type AuthorColor = number;

/**
 * The author represents a single user editing a note.
 * A 'user' can either be a registered and logged-in user or a browser session identified by its cookie.
 * All edits (aka authorships) of one user in a note must belong to the same author, so that the same color can be displayed.
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
  sessions: Session[];

  /**
   * User that this author corresponds to
   * Only set when the user was identified (by a browser session) as a registered user at edit-time
   */
  @ManyToOne(() => User, (user) => user.authors, { nullable: true })
  user: User | null;

  /**
   * List of authorships that this author created
   * All authorships must belong to the same note
   */
  @OneToMany(() => Authorship, (authorship) => authorship.author)
  authorships: Authorship[];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static create(
    color: number,
  ): Pick<Author, 'color' | 'sessions' | 'user' | 'authorships'> {
    const newAuthor = new Author();
    newAuthor.color = color;
    newAuthor.sessions = [];
    newAuthor.user = null;
    newAuthor.authorships = [];
    return newAuthor;
  }
}
