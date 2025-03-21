/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { BaseDto } from '../utils/base.dto';

export class HistoryEntryUpdateDto extends BaseDto {
  /**
   * True if the note should be pinned
   */
  @IsBoolean()
  @ApiProperty()
  pinStatus: boolean;
}
