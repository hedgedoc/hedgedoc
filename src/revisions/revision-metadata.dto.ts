/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsDate, IsNumber } from 'class-validator';
import { Revision } from './revision.entity';

export class RevisionMetadataDto {
  /**
   * ID of this revision
   * @example 13
   */
  @IsNumber()
  id: Revision['id'];

  /**
   * Datestring of the time this revision was created
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  createdAt: Date;

  /**
   * Number of characters in this revision
   * @example 142
   */
  @IsNumber()
  length: number;
}
