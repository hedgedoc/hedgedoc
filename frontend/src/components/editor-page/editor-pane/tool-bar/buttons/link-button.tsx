/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/use-change-editor-content-callback'
import { FormatterToolbarButton } from '../formatter-toolbar-button'
import { addLink } from '../formatters/add-link'
import React, { useCallback } from 'react'
import { Link as IconLink } from 'react-bootstrap-icons'

/**
 * Renders a button to insert a link in the {@link Editor editor}.
 */
export const LinkButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection, markdownContent }) => {
    return addLink(markdownContent, currentSelection)
  }, [])
  return <FormatterToolbarButton i18nKey={'link'} icon={IconLink} formatter={formatter} />
}
