/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IsOptional, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';

export class PendingUserConfirmationDto extends BaseDto {
  @IsString()
  username: string;

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  profilePicture: string | undefined;
}
