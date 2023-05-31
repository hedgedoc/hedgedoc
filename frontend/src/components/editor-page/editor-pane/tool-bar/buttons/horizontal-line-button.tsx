/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/use-change-editor-content-callback'
import { FormatterToolbarButton } from '../formatter-toolbar-button'
import { replaceSelection } from '../formatters/replace-selection'
import React, { useCallback } from 'react'
import { DashLg as IconDashLg } from 'react-bootstrap-icons'

/**
 * Renders a button to insert a horizontal line in the {@link Editor editor}.
 */
export const HorizontalLineButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection }) => {
    return replaceSelection({ from: currentSelection.to ?? currentSelection.from }, '----\n', true)
  }, [])
  return <FormatterToolbarButton i18nKey={'horizontalLine'} icon={IconDashLg} formatter={formatter} />
}
