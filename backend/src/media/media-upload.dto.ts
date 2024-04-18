/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsLowercase, IsOptional, IsString } from 'class-validator';

import { BaseDto } from '../utils/base.dto.';
import { Username } from '../utils/username';

export class MediaUploadDto extends BaseDto {
  /**
   * The id of the media file.
   * @example "testfile123.jpg"
   */
  @IsString()
  @ApiProperty()
  id: string;

  /**
   * The publicId of the note to which the uploaded file is linked to.
   * @example "b604x5885k9k01bq7tsmawvnp0"
   */
  @IsString()
  @IsOptional()
  @ApiProperty()
  notePublicId: string | null;

  /**
   * The date when the upload objects was created.
   * @example "2020-12-01 12:23:34"
   */
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  createdAt: Date;

  /**
   * The username of the user which uploaded the media file.
   * @example "testuser5"
   */
  @IsString()
  @IsLowercase()
  @IsOptional()
  @ApiProperty()
  username: Username | null;
}
