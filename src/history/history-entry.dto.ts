/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsBoolean, ValidateNested } from 'class-validator';
import { NoteMetadataDto } from '../notes/note-metadata.dto';

export class HistoryEntryDto {
  /**
   * Metadata of this note
   */
  @ValidateNested()
  metadata: NoteMetadataDto;

  /**
   * True if this note is pinned
   * @example false
   */
  @IsBoolean()
  pinStatus: boolean;
}
