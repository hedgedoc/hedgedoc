/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class AliasCreateDto extends BaseDto {
  /**
   * An alias pointing to the note for which the new aliases should be added to
   */
  @IsString()
  @ApiProperty()
  alias: string;

  /**
   * The new alias
   */
  @IsString()
  @ApiProperty()
  newAlias: string;
}
