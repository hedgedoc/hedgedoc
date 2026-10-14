/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export enum ExportMenuSelection {
  NONE = '',
  GIST = 'gist',
  SNIPPET = 'gitlab'
}

export interface ExportMenuProps extends ExportButtonProps {
  onClick: (menuId: ExportMenuSelection) => void
  menuId: ExportMenuSelection
}

export interface ExportButtonProps {
  selectedMenuId: ExportMenuSelection
}
