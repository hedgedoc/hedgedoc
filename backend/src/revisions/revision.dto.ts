/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';

import { EditDto } from './edit.dto';
import { RevisionMetadataDto } from './revision-metadata.dto';

export class RevisionDto extends RevisionMetadataDto {
  /**
   * Markdown content of the revision
   * @example "# I am a heading"
   */
  @IsString()
  @ApiProperty()
  content: string;

  /**
   * Patch from the preceding revision to this one
   */
  @IsString()
  @ApiProperty()
  patch: string;

  /**
   * All edit objects which are used in the revision.
   */
  @ValidateNested()
  @ApiProperty()
  edits: EditDto[];
}
