/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsDate, IsNumber, IsString } from 'class-validator';
import { Revision } from './revision.entity';

export class RevisionMetadataDto {
  @IsNumber()
  id: Revision['id'];

  @IsDate()
  createdAt: Date;

  @IsNumber()
  length: number;
}
