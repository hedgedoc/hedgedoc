/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IsLowercase, IsString } from 'class-validator';

import { Username } from '../../utils/username';

export class LoginDto {
  @IsString()
  @IsLowercase()
  username: Username;
  @IsString()
  password: string;
}
