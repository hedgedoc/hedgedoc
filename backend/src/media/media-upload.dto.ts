/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
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
   * The uuid of the media file.
   * @example "7697582e-0020-4188-9758-2e00207188ca"
   */
  @IsString()
  @ApiProperty()
  uuid: string;

  /**
   * The original filename of the media upload.
   * @example "example.png"
   */
  @IsString()
  @ApiProperty()
  fileName: string;

  /**
   * The publicId of the note to which the uploaded file is linked to.
   * @example "b604x5885k9k01bq7tsmawvnp0"
   */
  @IsString()
  @IsOptional()
  @ApiProperty()
  noteId: string | null;

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
