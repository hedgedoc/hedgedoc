/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

import { RangeAuthorshipDto } from '../revisions/range-authorship.dto';
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
  @Type(() => RangeAuthorshipDto)
  @ApiProperty({ isArray: true, type: RangeAuthorshipDto })
  editedByAtPosition: RangeAuthorshipDto[];
}
