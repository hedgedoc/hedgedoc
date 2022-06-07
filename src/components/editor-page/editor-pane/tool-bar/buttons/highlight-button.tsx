/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { ToolbarButton } from '../toolbar-button'
import { wrapSelection } from '../formatters/wrap-selection'
import type { ContentFormatter } from '../../../change-content-context/change-content-context'

export const HighlightButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection }) => {
    return wrapSelection(currentSelection, '==', '==')
  }, [])
  return <ToolbarButton i18nKey={'highlight'} iconName={'eraser'} formatter={formatter}></ToolbarButton>
}
