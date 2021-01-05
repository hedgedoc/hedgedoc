/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsBoolean, ValidateNested } from 'class-validator';
import { NoteMetadataDto } from '../notes/note-metadata.dto';

export class HistoryEntryDto {
  @ValidateNested()
  metadata: NoteMetadataDto;
  @IsBoolean()
  pinStatus: boolean;
}
