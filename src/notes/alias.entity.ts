/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Note } from './note.entity';
import { PrimaryValueTransformer } from './primary.value-transformer';

@Entity()
@Unique('Only one primary alias per note', ['note', 'primary'])
export class Alias {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * the actual alias
   */
  @Column({
    nullable: false,
    unique: true,
  })
  name: string;

  /**
   * Is this alias the primary alias, by which people access the note?
   */
  @Column({
    /*
      Because of the @Unique at the top of this entity, this field must be saved as null instead of false in the DB.
      If a non-primary alias would be saved with `primary: false` it would only be possible to have one non-primary and one primary alias.
      But a nullable field does not have such problems.
      This way the DB keeps track that one note really only has one primary alias.
      */
    comment:
      'This field tells you if this is the primary alias of the note. If this field is null, that means this alias is not primary.',
    nullable: true,
    transformer: new PrimaryValueTransformer(),
  })
  primary: boolean;

  @ManyToOne((_) => Note, (note) => note.aliases, {
    onDelete: 'CASCADE', // This deletes the Alias, when the associated Note is deleted
  })
  note: Promise<Note>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static create(name: string, note: Note, primary: boolean): Omit<Alias, 'id'> {
    const alias = new Alias();
    alias.name = name;
    alias.primary = primary;
    alias.note = Promise.resolve(note);
    return alias;
  }
}
