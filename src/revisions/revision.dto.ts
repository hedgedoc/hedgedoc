/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';
import { Revision } from './revision.entity';

export class RevisionDto extends BaseDto {
  /**
   * ID of this revision
   * @example 13
   */
  @IsNumber()
  @ApiProperty()
  id: Revision['id'];

  /**
   * Markdown content of the revision
   * @example "# I am a heading"
   */
  @IsString()
  @ApiProperty()
  content: string;

  /**
   * Patch from the preceding revision to this one
   */
  @IsString()
  @ApiProperty()
  patch: string;

  /**
   * Datestring of the time this revision was created
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  createdAt: Date;
}
