/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export interface SelectionInfoProps {
  count: number
  translationKey: 'column' | 'line'
}

/**
 * Renders a translated text that shows the number of selected columns or lines.
 *
 * @param count The number that should be included in the text
 * @param translationKey Defines if the text for selected columns or lines should be used
 */
export const SelectionInfo: React.FC<SelectionInfoProps> = ({ count, translationKey }) => {
  useTranslation()
  const countTranslationOptions = useMemo(() => ({ count: count }), [count])
  return (
    <span>
      <Trans i18nKey={`editor.statusBar.selection.${translationKey}`} values={countTranslationOptions} />
    </span>
  )
}
