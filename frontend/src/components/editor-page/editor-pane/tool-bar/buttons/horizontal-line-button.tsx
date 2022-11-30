/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/change-content-context'
import { replaceSelection } from '../formatters/replace-selection'
import { ToolbarButton } from '../toolbar-button'
import React, { useCallback } from 'react'

/**
 * Renders a button to insert a horizontal line in the {@link Editor editor}.
 */
export const HorizontalLineButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection }) => {
    return replaceSelection({ from: currentSelection.to ?? currentSelection.from }, '----\n', true)
  }, [])
  return <ToolbarButton i18nKey={'horizontalLine'} iconName={'minus'} formatter={formatter}></ToolbarButton>
}
