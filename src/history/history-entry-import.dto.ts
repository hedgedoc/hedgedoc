/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsString,
  ValidateNested,
} from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class HistoryEntryImportDto extends BaseDto {
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
  @Type(() => Date)
  lastVisited: Date;
}

export class HistoryEntryImportListDto extends BaseDto {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => HistoryEntryImportDto)
  history: HistoryEntryImportDto[];
}
