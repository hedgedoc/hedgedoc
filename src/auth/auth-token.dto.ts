/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsDate, IsOptional, IsString } from 'class-validator';

export class AuthTokenDto {
  @IsString()
  label: string;
  @IsString()
  keyId: string;
  @IsDate()
  createdAt: Date;
  @IsDate()
  @IsOptional()
  validUntil: Date;
  @IsDate()
  @IsOptional()
  lastUsed: Date;
}
