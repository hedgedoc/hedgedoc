/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLineBasedFromPosition } from '../hooks/use-line-based-position'
import React, { useMemo } from 'react'
import { Trans } from 'react-i18next'

/**
 * Renders a translated text that shows the given cursor position.
 */
export const CursorPositionInfo: React.FC = () => {
  const lineBasedPosition = useLineBasedFromPosition()

  const translationOptions = useMemo(
    () => ({
      line: lineBasedPosition.line + 1,
      columns: lineBasedPosition.character + 1
    }),
    [lineBasedPosition]
  )

  return translationOptions === undefined ? null : (
    <span>
      <Trans i18nKey={'editor.statusBar.cursor'} values={translationOptions} />
    </span>
  )
}
