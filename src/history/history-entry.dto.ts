/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsArray, IsBoolean, IsDate, IsString } from 'class-validator';

export class HistoryEntryDto {
  /**
   * ID or Alias of the note
   */
  @IsString()
  identifier: string;

  /**
   * Title of the note
   * Does not contain any markup but might be empty
   * @example "Shopping List"
   */
  @IsString()
  title: string;

  /**
   * Datestring of the last time this note was updated
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  lastVisited: Date;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  /**
   * True if this note is pinned
   * @example false
   */
  @IsBoolean()
  pinStatus: boolean;
}
