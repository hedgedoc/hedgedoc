/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { UserInfoDto } from '../users/user-info.dto';
import { NotePermissionsDto } from './note-permissions.dto';

export class NoteMetadataDto {
  /**
   * ID of the note
   */
  @IsString()
  @ApiProperty()
  id: string;

  /**
   * All aliases of the note (including the primaryAlias)
   */
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  aliases: string[];

  /**
   * The primary alias of the note
   */
  @IsString()
  @ApiProperty()
  primaryAlias: string | null;

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
  @ApiProperty()
  tags: string[];

  /**
   * Datestring of the last time this note was updated
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @ApiProperty()
  updatedAt: Date;

  /**
   * User that last edited the note
   */
  @IsString()
  @ApiPropertyOptional()
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
  @ApiProperty()
  createdAt: Date;

  /**
   * List of usernames that edited the note
   * @example "['john.smith', 'jane.smith']"
   */
  @IsArray()
  @ValidateNested()
  @ApiProperty()
  editedBy: UserInfoDto['username'][];

  /**
   * Permissions currently in effect for the note
   */
  @ValidateNested()
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
  @ApiProperty()
  tags: string[];
}
