/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { ToolbarButton } from '../toolbar-button'
import type { ContentFormatter } from '../../../change-content-context/change-content-context'
import { replaceSelection } from '../formatters/replace-selection'

/**
 * Renders a button to create a comment in the {@link Editor editor}.
 */
export const CommentButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection }) => {
    return replaceSelection({ from: currentSelection.to ?? currentSelection.from }, '> []', true)
  }, [])
  return <ToolbarButton i18nKey={'comment'} iconName={'comment'} formatter={formatter}></ToolbarButton>
}
