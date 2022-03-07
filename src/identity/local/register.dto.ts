/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  displayName: string;

  @IsString()
  password: string;
}
