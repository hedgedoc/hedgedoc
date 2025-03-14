/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NotePermissionLevel } from '../note-permission.enum';

export function convertEditabilityToPermissionLevel(
  canEdit: boolean,
): NotePermissionLevel {
  return canEdit ? NotePermissionLevel.WRITE : NotePermissionLevel.READ;
}
