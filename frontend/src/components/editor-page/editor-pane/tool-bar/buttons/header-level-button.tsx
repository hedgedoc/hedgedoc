/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/change-content-context'
import { prependLinesOfSelection } from '../formatters/prepend-lines-of-selection'
import { ToolbarButton } from '../toolbar-button'
import React, { useCallback } from 'react'
import { TypeH1 as IconTypeH1 } from 'react-bootstrap-icons'

/**
 * Renders a button to add a header in the {@link Editor editor}.
 */
export const HeaderLevelButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection, markdownContent }) => {
    return prependLinesOfSelection(markdownContent, currentSelection, (line) => (line.startsWith('#') ? `#` : `# `))
  }, [])
  return <ToolbarButton i18nKey={'header'} icon={IconTypeH1} formatter={formatter}></ToolbarButton>
}
