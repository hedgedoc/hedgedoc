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

export class NoteMetadataDto {
  /**
   * ID of the note
   */
  @IsString()
  id: string;

  /**
   * Alias of the note
   * Can be null
   */
  @IsString()
  @IsOptional()
  alias: string;

  /**
   * Title of the note
   * Does not contain any markup but might be empty
   * @example "Shopping List"
   */
  @IsString()
  title: string;

  /**
   * Description of the note
   * Does not contain any markup but might be empty
   * @example Everything I want to buy
   */
  @IsString()
  description: string;

  /**
   * List of tags assigned to this note
   * @example "['shopping', 'personal']
   */
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  /**
   * Datestring of the last time this note was updated
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  updateTime: Date;

  /**
   * User that last edited the note
   */
  @ValidateNested()
  updateUser: UserInfoDto;

  /**
   * Counts how many times the published note has been viewed
   * @example 42
   */
  @IsNumber()
  viewCount: number;

  /**
   * Datestring of the time this note was created
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  createTime: Date;

  /**
   * List of usernames that edited the note
   * @example "['john.smith', 'jane.smith']"
   */
  @IsArray()
  @ValidateNested()
  editedBy: UserInfoDto['userName'][];

  /**
   * Permissions currently in effect for the note
   */
  @ValidateNested()
  permissions: NotePermissionsDto;
}

export class NoteMetadataUpdateDto {
  /**
   * New title of the note
   * Can not contain any markup and might be empty
   * @example "Shopping List"
   */
  @IsString()
  title: string;

  /**
   * New description of the note
   * Can not contain any markup but might be empty
   * @example Everything I want to buy
   */
  @IsString()
  description: string;

  /**
   * New list of tags assigned to this note
   * @example "['shopping', 'personal']
   */
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
