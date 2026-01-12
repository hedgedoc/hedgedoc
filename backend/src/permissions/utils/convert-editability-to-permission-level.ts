/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';

/**
 * Converts a boolean indicating editability to a NotePermissionLevel
 *
 * @param canEdit A boolean indicating whether the note can be edited
 * @returns The corresponding PermissionLevel
 */
export function convertEditabilityToPermissionLevel(canEdit: boolean): PermissionLevel {
  return canEdit ? PermissionLevel.WRITE : PermissionLevel.READ;
}
