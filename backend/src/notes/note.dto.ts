/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

import { EditDto } from '../revisions/edit.dto';
import { BaseDto } from '../utils/base.dto.';
import { NoteMetadataDto } from './note-metadata.dto';

export class NoteDto extends BaseDto {
  /**
   * Markdown content of the note
   * @example "# I am a heading"
   */
  @IsString()
  @ApiProperty()
  content: string;

  /**
   * Metadata of the note
   */
  @Type(() => NoteMetadataDto)
  @ValidateNested()
  @ApiProperty({ type: NoteMetadataDto })
  metadata: NoteMetadataDto;

  /**
   * Edit information of this note
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EditDto)
  @ApiProperty({ isArray: true, type: EditDto })
  editedByAtPosition: EditDto[];
}
