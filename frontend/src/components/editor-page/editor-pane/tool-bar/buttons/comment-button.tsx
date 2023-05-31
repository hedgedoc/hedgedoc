/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/use-change-editor-content-callback'
import { FormatterToolbarButton } from '../formatter-toolbar-button'
import { replaceSelection } from '../formatters/replace-selection'
import React, { useCallback } from 'react'
import { ChatDots as IconChatDots } from 'react-bootstrap-icons'

/**
 * Renders a button to create a comment in the {@link Editor editor}.
 */
export const CommentButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection }) => {
    return replaceSelection({ from: currentSelection.to ?? currentSelection.from }, '> []', true)
  }, [])
  return <FormatterToolbarButton i18nKey={'comment'} icon={IconChatDots} formatter={formatter} />
}
