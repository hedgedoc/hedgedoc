/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsArray, IsString, ValidateNested } from 'class-validator';
import { NoteAuthorshipDto } from './note-authorship.dto';
import { NoteMetadataDto } from './note-metadata.dto';

export class NoteDto {
  /**
   * Markdown content of the note
   * @example "# I am a heading"
   */
  @IsString()
  content: string;

  /**
   * Metadata of the note
   */
  @ValidateNested()
  metadata: NoteMetadataDto;

  /**
   * Authorship information of this note
   */
  @IsArray()
  @ValidateNested({ each: true })
  editedByAtPosition: NoteAuthorshipDto[];
}
