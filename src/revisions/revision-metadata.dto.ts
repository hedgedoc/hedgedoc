/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsDate, IsNumber } from 'class-validator';
import { Revision } from './revision.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RevisionMetadataDto {
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
  @ApiProperty()
  createdAt: Date;

  /**
   * Number of characters in this revision
   * @example 142
   */
  @IsNumber()
  @ApiProperty()
  length: number;
}
