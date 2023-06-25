/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsLowercase,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BaseDto } from '../utils/base.dto.';
import { Username } from '../utils/username';

export class NoteUserPermissionEntryDto extends BaseDto {
  /**
   * Username of the User this permission applies to
   */
  @Type(() => String)
  @IsString()
  @IsLowercase()
  @ApiProperty()
  username: Username;

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
  @Type(() => String)
  @IsString()
  @IsLowercase()
  @ApiProperty()
  username: Username;

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
  // nestjs-typed does not detect '| null' types as optional
  // eslint-disable-next-line @darraghor/nestjs-typed/api-property-matches-property-optionality
  @Type(() => String)
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  owner: string | null;

  /**
   * List of users the note is shared with
   */
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => NoteUserPermissionEntryDto)
  @ApiProperty({ isArray: true, type: NoteUserPermissionEntryDto })
  sharedToUsers: NoteUserPermissionEntryDto[];

  /**
   * List of groups the note is shared with
   */
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => NoteGroupPermissionEntryDto)
  @ApiProperty({ isArray: true, type: NoteGroupPermissionEntryDto })
  sharedToGroups: NoteGroupPermissionEntryDto[];
}

export class NotePermissionsUpdateDto {
  /**
   * List of users the note should be shared with
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteUserPermissionUpdateDto)
  @ApiProperty({ isArray: true, type: NoteUserPermissionUpdateDto })
  sharedToUsers: NoteUserPermissionUpdateDto[];

  /**
   * List of groups the note should be shared with
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteGroupPermissionUpdateDto)
  @ApiProperty({ isArray: true, type: NoteGroupPermissionUpdateDto })
  sharedToGroups: NoteGroupPermissionUpdateDto[];
}
