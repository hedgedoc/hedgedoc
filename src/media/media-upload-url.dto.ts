/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class MediaUploadUrlDto extends BaseDto {
  @IsString()
  @ApiProperty()
  link: string;
}
