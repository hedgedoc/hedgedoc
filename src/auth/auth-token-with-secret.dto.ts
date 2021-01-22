/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsString } from 'class-validator';
import { AuthTokenDto } from './auth-token.dto';

export class AuthTokenWithSecretDto extends AuthTokenDto {
  @IsString()
  secret: string;
}
