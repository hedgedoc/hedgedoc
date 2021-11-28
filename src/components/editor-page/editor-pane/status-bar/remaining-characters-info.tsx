/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { cypressId } from '../../../../utils/cypress-attribute'
import { Trans, useTranslation } from 'react-i18next'

export interface LengthInfoProps {
  remainingCharacters: number
  charactersInDocument: number
}

/**
 * Renders a translated text that shows the number of remaining characters.
 *
 * @param remainingCharacters The number of characters that are still available in this document
 * @param charactersInDocument The total number of characters in the document
 */
export const RemainingCharactersInfo: React.FC<LengthInfoProps> = ({ remainingCharacters, charactersInDocument }) => {
  const { t } = useTranslation()

  const remainingCharactersClass = useMemo(() => {
    if (remainingCharacters <= 0) {
      return 'text-danger'
    } else if (remainingCharacters <= 100) {
      return 'text-warning'
    } else {
      return ''
    }
  }, [remainingCharacters])

  const lengthTooltip = useMemo(() => {
    if (remainingCharacters === 0) {
      return t('editor.statusBar.lengthTooltip.maximumReached')
    } else if (remainingCharacters < 0) {
      return t('editor.statusBar.lengthTooltip.exceeded', { exceeded: -remainingCharacters })
    } else {
      return t('editor.statusBar.lengthTooltip.remaining', { remaining: remainingCharacters })
    }
  }, [remainingCharacters, t])

  const translationOptions = useMemo(() => ({ length: charactersInDocument }), [charactersInDocument])

  return (
    <span {...cypressId('remainingCharacters')} title={lengthTooltip} className={remainingCharactersClass}>
      <Trans i18nKey={'editor.statusBar.length'} values={translationOptions} />
    </span>
  )
}
