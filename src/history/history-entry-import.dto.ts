/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsBoolean, IsDate, IsString } from 'class-validator';

export class HistoryEntryImportDto {
  /**
   * ID or Alias of the note
   */
  @IsString()
  note: string;
  /**
   * True if the note should be pinned
   * @example true
   */
  @IsBoolean()
  pinStatus: boolean;
  /**
   * Datestring of the last time this note was updated
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  lastVisited: Date;
}
