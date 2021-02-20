/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IsBoolean, IsString } from 'class-validator';

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
