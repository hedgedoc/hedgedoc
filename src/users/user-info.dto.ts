/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserInfoDto {
  /**
   * The username
   * @example "john.smith"
   */
  @IsString()
  userName: string;

  /**
   * The display name
   * @example "John Smith"
   */
  @IsString()
  displayName: string;

  /**
   * URL of the profile picture
   * @example "https://hedgedoc.example.com/uploads/johnsmith.png"
   */
  @ApiProperty({
    format: 'uri',
  })
  @IsString()
  photo: string;

  /**
   * Email address of the user
   * @example "john.smith@example.com"
   */
  @ApiProperty({
    format: 'email',
  })
  @IsString()
  email: string;
}
