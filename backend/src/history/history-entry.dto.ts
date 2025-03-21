/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
} from 'class-validator';

import { BaseDto } from '../utils/base.dto';

export class HistoryEntryDto extends BaseDto {
  /**
   * ID or Alias of the note
   */
  @IsString()
  @ApiProperty()
  identifier: string;

  /**
   * Title of the note
   * Does not contain any markup but might be empty
   * @example "Shopping List"
   */
  @IsString()
  @ApiProperty()
  title: string;

  /**
   * The username of the owner of the note
   * Might be null for anonymous notes
   * @example "alice"
   */
  @IsOptional()
  @IsString()
  @ApiProperty()
  owner: string | null;

  /**
   * Datestring of the last time this note was updated
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  lastVisitedAt: Date;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ isArray: true, type: String })
  tags: string[];

  /**
   * True if this note is pinned
   * @example false
   */
  @IsBoolean()
  @ApiProperty()
  pinStatus: boolean;
}
