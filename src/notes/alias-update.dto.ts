/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class AliasUpdateDto extends BaseDto {
  /**
   * Whether the alias should become the primary alias or not
   */
  @IsBoolean()
  @ApiProperty()
  primaryAlias: boolean;
}
