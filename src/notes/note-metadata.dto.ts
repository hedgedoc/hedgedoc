/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NoteMetadataDto {
  /**
   * ID of the note
   */
  @IsString()
  @ApiProperty()
  id: string;

  /**
   * Alias of the note
   * Can be null
   */
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  alias: string;

  /**
   * The version of HedgeDoc the note was created with
   * @example 2
   */
  @IsNumber()
  @ApiProperty()
  version: number;

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
  updateTime: Date;

  /**
   * User that last edited the note
   */
  @ValidateNested()
  @ApiProperty({ type: UserInfoDto })
  updateUser: UserInfoDto;

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
  createTime: Date;

  /**
   * List of usernames that edited the note
   * @example "['john.smith', 'jane.smith']"
   */
  @IsArray()
  @ValidateNested()
  @ApiProperty()
  editedBy: UserInfoDto['userName'][];

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
