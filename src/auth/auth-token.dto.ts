/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IsDate, IsOptional, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class AuthTokenDto extends BaseDto {
  @IsString()
  label: string;
  @IsString()
  keyId: string;
  @IsDate()
  createdAt: Date;
  @IsDate()
  validUntil: Date;
  @IsDate()
  @IsOptional()
  lastUsedAt: Date | null;
}
