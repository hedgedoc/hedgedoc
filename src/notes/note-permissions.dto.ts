/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class NoteUserPermissionEntryDto extends BaseDto {
  /**
   * Username of the User this permission applies to
   */
  @IsString()
  @ApiProperty()
  username: string;

  /**
   * True if the user is allowed to edit the note
   * @example false
   */
  @IsBoolean()
  @ApiProperty()
  canEdit: boolean;
}

export class NoteUserPermissionUpdateDto {
  /**
   * Username of the user this permission should apply to
   * @example "john.smith"
   */
  @IsString()
  @ApiProperty()
  username: string;

  /**
   * True if the user should be allowed to edit the note
   * @example false
   */
  @IsBoolean()
  @ApiProperty()
  canEdit: boolean;
}

export class NoteGroupPermissionEntryDto {
  /**
   * Name of the Group this permission applies to
   */
  @IsString()
  @ApiProperty()
  groupName: string;

  /**
   * True if the group members are allowed to edit the note
   * @example false
   */
  @IsBoolean()
  @ApiProperty()
  canEdit: boolean;
}

export class NoteGroupPermissionUpdateDto {
  /**
   * Name of the group this permission should apply to
   * @example "superheroes"
   */
  @IsString()
  @ApiProperty()
  groupName: string;

  /**
   * True if the group members should be allowed to edit the note
   * @example false
   */
  @IsBoolean()
  @ApiProperty()
  canEdit: boolean;
}

export class NotePermissionsDto {
  /**
   * Username of the User this permission applies to
   */
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  owner: string | null;

  /**
   * List of users the note is shared with
   */
  @ValidateNested()
  @IsArray()
  @ApiProperty({ isArray: true, type: NoteUserPermissionEntryDto })
  sharedToUsers: NoteUserPermissionEntryDto[];

  /**
   * List of groups the note is shared with
   */
  @ValidateNested()
  @IsArray()
  @ApiProperty({ isArray: true, type: NoteGroupPermissionEntryDto })
  sharedToGroups: NoteGroupPermissionEntryDto[];
}

export class NotePermissionsUpdateDto {
  /**
   * List of users the note should be shared with
   */
  @IsArray()
  @ValidateNested()
  @ApiProperty({ isArray: true, type: NoteUserPermissionUpdateDto })
  sharedToUsers: NoteUserPermissionUpdateDto[];

  /**
   * List of groups the note should be shared with
   */
  @IsArray()
  @ValidateNested()
  @ApiProperty({ isArray: true, type: NoteGroupPermissionUpdateDto })
  sharedToGroups: NoteGroupPermissionUpdateDto[];
}
