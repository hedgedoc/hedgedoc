/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class HistoryEntryUpdateDto {
  /**
   * True if the note should be pinned
   */
  @IsBoolean()
  @ApiProperty()
  pinStatus: boolean;
}
