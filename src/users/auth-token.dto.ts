/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsNumber, IsString } from 'class-validator';

export class AuthTokenDto {
  @IsString()
  label: string;
  @IsNumber()
  created: number;
  @IsNumber()
  validUntil: number | null;
  @IsNumber()
  lastUsed: number | null;
}
