/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class MediaUploadDto {
  /**
   * The link to the media file.
   * @example "https://example.com/uploads/testfile123.jpg"
   */
  @IsString()
  @ApiProperty()
  url: string;

  /**
   * The noteId of the note to which the uploaded file is linked to.
   * @example "noteId" TODO how looks a note id?
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
  @ApiProperty()
  createdAt: Date;

  /**
   * The username of the user which uploaded the media file.
   * @example "testuser5"
   */
  @IsString()
  @ApiProperty()
  username: string;
}
