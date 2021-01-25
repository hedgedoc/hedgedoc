/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { UserInfoDto } from '../users/user-info.dto';

export class NoteUserPermissionEntryDto {
  /**
   * User this permission applies to
   */
  @ValidateNested()
  user: UserInfoDto;

  /**
   * True if the user is allowed to edit the note
   * @example false
   */
  @IsBoolean()
  canEdit: boolean;
}

export class NoteUserPermissionUpdateDto {
  /**
   * Username of the user this permission should apply to
   * @example "john.smith"
   */
  @IsString()
  username: string;

  /**
   * True if the user should be allowed to edit the note
   * @example false
   */
  @IsBoolean()
  canEdit: boolean;
}

export class GroupInfoDto {
  /**
   * Name of the group
   * @example "superheroes"
   */
  @IsString()
  name: string;

  /**
   * Display name of this group
   * @example "Superheroes"
   */
  @IsString()
  displayName: string;

  /**
   * True if this group must be specially handled
   * Used for e.g. "everybody", "all logged in users"
   * @example false
   */
  @IsBoolean()
  special: boolean;
}

export class NoteGroupPermissionEntryDto {
  /**
   * Group this permission applies to
   */
  @ValidateNested()
  group: GroupInfoDto;

  /**
   * True if the group members are allowed to edit the note
   * @example false
   */
  @IsBoolean()
  canEdit: boolean;
}

export class NoteGroupPermissionUpdateDto {
  /**
   * Name of the group this permission should apply to
   * @example "superheroes"
   */
  @IsString()
  groupname: string;

  /**
   * True if the group members should be allowed to edit the note
   * @example false
   */
  @IsBoolean()
  canEdit: boolean;
}

export class NotePermissionsDto {
  /**
   * User this permission applies to
   */
  @ValidateNested()
  owner: UserInfoDto;

  /**
   * List of users the note is shared with
   */
  @ValidateNested()
  @IsArray()
  sharedToUsers: NoteUserPermissionEntryDto[];

  /**
   * List of groups the note is shared with
   */
  @ValidateNested()
  @IsArray()
  sharedToGroups: NoteGroupPermissionEntryDto[];
}

export class NotePermissionsUpdateDto {
  /**
   * List of users the note should be shared with
   */
  @IsArray()
  @ValidateNested()
  sharedToUsers: NoteUserPermissionUpdateDto[];

  /**
   * List of groups the note should be shared with
   */
  @IsArray()
  @ValidateNested()
  sharedToGroups: NoteGroupPermissionUpdateDto[];
}
