/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class AliasUpdateDto extends BaseDto {
  /**
   * Set to true to make this alias the primary one
   */
  @IsBoolean()
  @ApiProperty()
  primaryAlias: boolean;
}
