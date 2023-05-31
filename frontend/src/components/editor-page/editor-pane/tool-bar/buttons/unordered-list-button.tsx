/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/use-change-editor-content-callback'
import { FormatterToolbarButton } from '../formatter-toolbar-button'
import { prependLinesOfSelection } from '../formatters/prepend-lines-of-selection'
import React, { useCallback } from 'react'
import { List as IconList } from 'react-bootstrap-icons'

/**
 * Renders a button to insert an unordered list in the {@link Editor editor}.
 */
export const UnorderedListButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection, markdownContent }) => {
    return prependLinesOfSelection(markdownContent, currentSelection, () => `- `)
  }, [])
  return <FormatterToolbarButton i18nKey={'unorderedList'} icon={IconList} formatter={formatter} />
}
