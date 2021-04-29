/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserInfoDto } from '../users/user-info.dto';
import { GroupInfoDto } from '../groups/group-info.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NoteUserPermissionEntryDto {
  /**
   * User this permission applies to
   */
  @ValidateNested()
  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;

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
   * Group this permission applies to
   */
  @ValidateNested()
  @ApiProperty({ type: GroupInfoDto })
  group: GroupInfoDto;

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
  groupname: string;

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
   * User this permission applies to
   */
  @ValidateNested()
  @ApiPropertyOptional({ type: UserInfoDto })
  @IsOptional()
  owner?: UserInfoDto;

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
