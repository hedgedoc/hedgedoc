/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/change-content-context'
import { addLink } from '../formatters/add-link'
import { ToolbarButton } from '../toolbar-button'
import React, { useCallback } from 'react'

/**
 * Renders a button to insert a link in the {@link Editor editor}.
 */
export const LinkButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection, markdownContent }) => {
    return addLink(markdownContent, currentSelection)
  }, [])
  return <ToolbarButton i18nKey={'link'} iconName={'link'} formatter={formatter}></ToolbarButton>
}
