/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BaseDto } from '../utils/base.dto.';
import { AliasDto } from './alias.dto';
import { NotePermissionsDto } from './note-permissions.dto';

export class NoteMetadataDto extends BaseDto {
  /**
   * ID of the note
   */
  @IsString()
  @ApiProperty()
  id: string;

  /**
   * All aliases of the note (including the primaryAlias)
   */
  @Type(() => AliasDto)
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ isArray: true, type: AliasDto })
  aliases: AliasDto[];

  /**
   * The primary adress of the note
   * If at least one alias is set, this is the primary alias
   * If no alias is set, this is the note's ID
   */
  @IsString()
  @ApiProperty()
  primaryAddress: string;

  /**
   * Title of the note
   * Does not contain any markup but might be empty
   * @example "Shopping List"
   */
  @IsString()
  @ApiProperty()
  title: string;

  /**
   * Description of the note
   * Does not contain any markup but might be empty
   * @example Everything I want to buy
   */
  @IsString()
  @ApiProperty()
  description: string;

  /**
   * List of tags assigned to this note
   * @example "['shopping', 'personal']
   */
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ isArray: true, type: String })
  tags: string[];

  @IsNumber()
  @ApiProperty()
  version: number;

  /**
   * Datestring of the last time this note was updated
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  updatedAt: Date;

  /**
   * User that last edited the note
   */
  // eslint-disable-next-line @darraghor/nestjs-typed/api-property-matches-property-optionality
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  updateUsername: string | null;

  /**
   * Counts how many times the published note has been viewed
   * @example 42
   */
  @IsNumber()
  @ApiProperty()
  viewCount: number;

  /**
   * Datestring of the time this note was created
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  createdAt: Date;

  /**
   * List of usernames that edited the note
   * @example "['john.smith', 'jane.smith']"
   */
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ isArray: true, type: String })
  editedBy: string[];

  /**
   * Permissions currently in effect for the note
   */
  @ValidateNested()
  @Type(() => NotePermissionsDto)
  @ApiProperty({ type: NotePermissionsDto })
  permissions: NotePermissionsDto;
}

export class NoteMetadataUpdateDto {
  /**
   * New title of the note
   * Can not contain any markup and might be empty
   * @example "Shopping List"
   */
  @IsString()
  @ApiProperty()
  title: string;

  /**
   * New description of the note
   * Can not contain any markup but might be empty
   * @example Everything I want to buy
   */
  @IsString()
  @ApiProperty()
  description: string;

  /**
   * New list of tags assigned to this note
   * @example "['shopping', 'personal']
   */
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ isArray: true, type: String })
  tags: string[];
}
