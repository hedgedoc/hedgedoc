/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/use-change-editor-content-callback'
import { FormatterToolbarButton } from '../formatter-toolbar-button'
import { wrapSelection } from '../formatters/wrap-selection'
import React, { useCallback } from 'react'
import { TypeUnderline as IconTypeUnderline } from 'react-bootstrap-icons'

/**
 * Renders a button to underline the selection in the {@link Editor editor}.
 */
export const UnderlineButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection }) => {
    return wrapSelection(currentSelection, '++', '++')
  }, [])
  return <FormatterToolbarButton i18nKey={'underline'} icon={IconTypeUnderline} formatter={formatter} />
}
