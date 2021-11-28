/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export interface LinesInDocumentInfoProps {
  numberOfLinesInDocument: number
}

/**
 * Renders a translated text that shows the number of lines in the document.
 *
 * @param linesInDocument The number of lines in the document
 */
export const NumberOfLinesInDocumentInfo: React.FC<LinesInDocumentInfoProps> = ({ numberOfLinesInDocument }) => {
  useTranslation()

  const translationOptions = useMemo(() => ({ lines: numberOfLinesInDocument }), [numberOfLinesInDocument])

  return (
    <span>
      <Trans i18nKey={'editor.statusBar.lines'} values={translationOptions} />
    </span>
  )
}
