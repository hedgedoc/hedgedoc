/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsDate, IsNumber, IsString } from 'class-validator';
import { Revision } from './revision.entity';

export class RevisionDto {
  /**
   * ID of this revision
   * @example 13
   */
  @IsNumber()
  id: Revision['id'];

  /**
   * Markdown content of the revision
   * @example "# I am a heading"
   */
  @IsString()
  content: string;

  /**
   * Patch from the preceding revision to this one
   */
  @IsString()
  patch: string;

  /**
   * Datestring of the time this revision was created
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  createdAt: Date;
}
