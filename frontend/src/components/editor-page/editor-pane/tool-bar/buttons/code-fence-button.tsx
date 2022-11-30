/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/change-content-context'
import { changeCursorsToWholeLineIfNoToCursor } from '../formatters/utils/change-cursors-to-whole-line-if-no-to-cursor'
import { wrapSelection } from '../formatters/wrap-selection'
import { ToolbarButton } from '../toolbar-button'
import React, { useCallback } from 'react'

/**
 * Renders a button to create a code fence in the {@link Editor editor}.
 */
export const CodeFenceButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection, markdownContent }) => {
    return wrapSelection(changeCursorsToWholeLineIfNoToCursor(markdownContent, currentSelection), '```\n', '\n```')
  }, [])
  return <ToolbarButton i18nKey={'code'} iconName={'code'} formatter={formatter}></ToolbarButton>
}
