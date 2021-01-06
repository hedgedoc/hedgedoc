/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../notes/note.entity';

@Entity()
export class Author {
  //TODO: Still missing many properties
  @PrimaryGeneratedColumn()
  id: number;

  note: Note;
}
