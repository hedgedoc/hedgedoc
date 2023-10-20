/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { SeparatorDash } from './separator-dash'
import React, { Fragment, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Shows the total number of selected characters.
 */
export const SelectedCharacters: React.FC = () => {
  useTranslation()

  const selection = useApplicationState((state) => state.noteDetails?.selection)
  const count = useMemo(
    () => (selection === undefined || selection.to === undefined ? null : selection.to - selection.from),
    [selection]
  )
  const countTranslationOptions = useMemo(() => ({ count }), [count])

  return count === undefined ? null : (
    <Fragment>
      <SeparatorDash />
      <span>
        <Trans i18nKey={`editor.statusBar.selection.characters`} values={countTranslationOptions} />
      </span>
    </Fragment>
  )
}
