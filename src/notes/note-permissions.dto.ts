/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { UserInfoDto } from '../users/user-info.dto';

export class NoteUserPermissionEntryDto {
  @ValidateNested()
  user: UserInfoDto;
  @IsBoolean()
  canEdit: boolean;
}

export class NoteUserPermissionUpdateDto {
  @IsString()
  username: string;
  @IsBoolean()
  canEdit: boolean;
}

export class GroupInfoDto {
  @IsString()
  name: string;
  @IsString()
  displayName: string;
  @IsBoolean()
  special: boolean;
}

export class NoteGroupPermissionEntryDto {
  @ValidateNested()
  group: GroupInfoDto;
  @IsBoolean()
  canEdit: boolean;
}

export class NoteGroupPermissionUpdateDto {
  @IsString()
  groupname: string;
  @IsBoolean()
  canEdit: boolean;
}

export class NotePermissionsDto {
  @ValidateNested()
  owner: UserInfoDto;
  @ValidateNested()
  @IsArray()
  sharedToUsers: NoteUserPermissionEntryDto[];
  @ValidateNested()
  @IsArray()
  sharedToGroups: NoteGroupPermissionEntryDto[];
}

export class NotePermissionsUpdateDto {
  @IsArray()
  @ValidateNested()
  sharedToUsers: NoteUserPermissionUpdateDto[];
  @IsArray()
  @ValidateNested()
  sharedToGroups: NoteGroupPermissionUpdateDto[];
}
