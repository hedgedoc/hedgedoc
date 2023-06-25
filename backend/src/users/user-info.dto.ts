/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsLowercase, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';
import { Username } from '../utils/username';

export class UserInfoDto extends BaseDto {
  /**
   * The username
   * @example "john.smith"
   */
  @Type(() => String)
  @IsString()
  @IsLowercase()
  @ApiProperty()
  username: Username;

  /**
   * The display name
   * @example "John Smith"
   */
  @IsString()
  @ApiProperty()
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
}

/**
 * This DTO contains all attributes of the standard UserInfoDto
 * in addition to the email address.
 */
export class FullUserInfoDto extends UserInfoDto {
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

export class UserLoginInfoDto extends UserInfoDto {
  /**
   * Identifier of the auth provider that was used to log in
   */
  @ApiProperty()
  @IsString()
  authProvider: string;
}
