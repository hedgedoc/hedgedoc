/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { RangeAuthorshipDto } from './range-authorship.dto';
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
   * All range authorship objects which are used in the revision.
   */
  @Type(() => RangeAuthorshipDto)
  @ValidateNested({ each: true })
  @ApiProperty({ isArray: true, type: RangeAuthorshipDto })
  rangeAuthorships: RangeAuthorshipDto[];
}
