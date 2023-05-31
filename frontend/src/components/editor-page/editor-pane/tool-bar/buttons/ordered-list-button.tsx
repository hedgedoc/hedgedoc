/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/use-change-editor-content-callback'
import { FormatterToolbarButton } from '../formatter-toolbar-button'
import { prependLinesOfSelection } from '../formatters/prepend-lines-of-selection'
import React, { useCallback } from 'react'
import { ListOl as IconListOl } from 'react-bootstrap-icons'

/**
 * Renders a button to insert an ordered list in the {@link Editor editor}.
 */
export const OrderedListButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection, markdownContent }) => {
    return prependLinesOfSelection(
      markdownContent,
      currentSelection,
      (line, lineIndexInBlock) => `${lineIndexInBlock + 1}. `
    )
  }, [])
  return <FormatterToolbarButton i18nKey={'orderedList'} icon={IconListOl} formatter={formatter} />
}
