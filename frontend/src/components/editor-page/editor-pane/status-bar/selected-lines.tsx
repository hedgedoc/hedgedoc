/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLineBasedFromPosition, useLineBasedToPosition } from '../hooks/use-line-based-position'
import { SeparatorDash } from './separator-dash'
import React, { Fragment, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Shows the total number of selected lines.
 */
export const SelectedLines: React.FC = () => {
  useTranslation()

  const from = useLineBasedFromPosition()
  const to = useLineBasedToPosition()

  const count = useMemo(() => (to ? to?.line - from.line + 1 : 0), [from.line, to])

  const countTranslationOptions = useMemo(() => ({ count }), [count])

  return count <= 1 ? null : (
    <Fragment>
      <SeparatorDash />
      <span>
        <Trans i18nKey={`editor.statusBar.selection.lines`} values={countTranslationOptions} />
      </span>
    </Fragment>
  )
}
