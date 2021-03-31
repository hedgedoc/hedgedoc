/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NoteMediaDeletionDto {
  /**
   * Should the associated mediaUploads be keept
   * @default false
   * @example false
   */
  @IsBoolean()
  @ApiProperty()
  keepMedia: boolean;
}
