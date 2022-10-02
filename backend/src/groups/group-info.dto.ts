/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class GroupInfoDto extends BaseDto {
  /**
   * Name of the group
   * @example "superheroes"
   */
  @IsString()
  @ApiProperty()
  name: string;

  /**
   * Display name of this group
   * @example "Superheroes"
   */
  @IsString()
  @ApiProperty()
  displayName: string;

  /**
   * True if this group must be specially handled
   * Used for e.g. "everybody", "all logged in users"
   * @example false
   */
  @IsBoolean()
  @ApiProperty()
  special: boolean;
}
