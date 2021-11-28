/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Trans } from 'react-i18next'
import type { Position } from 'codemirror'

export interface CursorPositionInfoProps {
  cursorPosition: Position
}

/**
 * Renders a translated text that shows the given cursor position.
 *
 * @param cursorPosition The cursor position that should be included
 */
export const CursorPositionInfo: React.FC<CursorPositionInfoProps> = ({ cursorPosition }) => {
  const translationOptions = useMemo(
    () => ({
      line: cursorPosition.line + 1,
      columns: cursorPosition.ch + 1
    }),
    [cursorPosition.ch, cursorPosition.line]
  )

  return (
    <span>
      <Trans i18nKey={'editor.statusBar.cursor'} values={translationOptions} />
    </span>
  )
}
