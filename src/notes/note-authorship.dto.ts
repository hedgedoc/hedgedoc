/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsDate, IsNumber, IsString, Min } from 'class-validator';
import { UserInfoDto } from '../users/user-info.dto';

export class NoteAuthorshipDto {
  @IsString()
  userName: UserInfoDto['userName'];
  @IsNumber()
  @Min(0)
  startPos: number;
  @IsNumber()
  @Min(0)
  endPos: number;
  @IsDate()
  createdAt: Date;
  @IsDate()
  updatedAt: Date;
}
