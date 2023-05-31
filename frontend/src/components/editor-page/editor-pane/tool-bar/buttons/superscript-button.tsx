/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/use-change-editor-content-callback'
import { FormatterToolbarButton } from '../formatter-toolbar-button'
import { wrapSelection } from '../formatters/wrap-selection'
import React, { useCallback } from 'react'
import { Superscript as IconSuperscript } from 'react-bootstrap-icons'

/**
 * Renders a button to format the selection in the {@link Editor editor} as superscript.
 */
export const SuperscriptButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection }) => {
    return wrapSelection(currentSelection, '^', '^')
  }, [])
  return <FormatterToolbarButton i18nKey={'superscript'} icon={IconSuperscript} formatter={formatter} />
}
