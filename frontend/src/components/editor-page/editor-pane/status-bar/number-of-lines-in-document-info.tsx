/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a translated text that shows the number of lines in the document.
 */
export const NumberOfLinesInDocumentInfo: React.FC = () => {
  useTranslation()

  const linesInDocument = useApplicationState((state) => state.noteDetails?.markdownContent.lines.length ?? 0)
  const translationOptions = useMemo(() => ({ lines: linesInDocument }), [linesInDocument])

  return (
    <span>
      <Trans i18nKey={'editor.statusBar.lines'} values={translationOptions} />
    </span>
  )
}
