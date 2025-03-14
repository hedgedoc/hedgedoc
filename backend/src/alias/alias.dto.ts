/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class AliasDto extends BaseDto {
  /**
   * The name of the alias
   */
  @IsString()
  @ApiProperty()
  name: string;

  /**
   * Whether the alias if the primary one
   */
  @IsBoolean()
  @ApiProperty()
  isPrimary: boolean;
}
