/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';
import { Revision } from './revision.entity';

export class RevisionMetadataDto extends BaseDto {
  /**
   * ID of this revision
   * @example 13
   */
  @IsNumber()
  @ApiProperty()
  id: Revision['id'];

  /**
   * Datestring of the time this revision was created
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  createdAt: Date;

  /**
   * Number of characters in this revision
   * @example 142
   */
  @IsNumber()
  @ApiProperty()
  length: number;

  /**
   * List of the usernames that have contributed to this revision
   * Does not include anonymous users
   */
  @IsString()
  @ApiProperty()
  authorUsernames: string[];

  /**
   * Count of anonymous users that have contributed to this revision
   */
  @IsNumber()
  @ApiProperty()
  anonymousAuthorCount: number;
}
