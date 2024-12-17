/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Type } from 'class-transformer';
import { IsLowercase, IsString } from 'class-validator';

import { Username } from '../../utils/username';

export class RegisterDto {
  @Type(() => String)
  @IsString()
  @IsLowercase()
  username: Username;

  @IsString()
  displayName: string;

  @IsString()
  password: string;
}
