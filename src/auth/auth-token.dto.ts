/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class AuthTokenDto extends BaseDto {
  @IsString()
  label: string;

  @IsString()
  keyId: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  validUntil: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastUsedAt: Date | null;
}

export class AuthTokenWithSecretDto extends AuthTokenDto {
  @IsString()
  secret: string;
}
