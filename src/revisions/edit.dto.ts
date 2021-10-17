/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { UserInfoDto } from '../users/user-info.dto';

export class EditDto {
  /**
   * Username of the user who authored this section
   * Is `null` if the user is anonymous
   * @example "john.smith"
   */
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  username: UserInfoDto['username'] | null;

  /**
   * Character index of the start of this section
   * @example 102
   */
  @IsNumber()
  @Min(0)
  @ApiProperty()
  startPos: number;

  /**
   * Character index of the end of this section
   * Must be greater than {@link startPos}
   * @example 154
   */
  @IsNumber()
  @Min(0)
  @ApiProperty()
  endPos: number;

  /**
   * Datestring of the time this section was created
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @ApiProperty()
  createdAt: Date;

  /**
   * Datestring of the last time this section was edited
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @ApiProperty()
  updatedAt: Date;
}
