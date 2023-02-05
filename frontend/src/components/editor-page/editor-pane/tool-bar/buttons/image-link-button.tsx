/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../../change-content-context/change-content-context'
import { addLink } from '../formatters/add-link'
import { ToolbarButton } from '../toolbar-button'
import React, { useCallback } from 'react'
import { Image as IconImage } from 'react-bootstrap-icons'

/**
 * Renders a button to insert an image in the {@link Editor editor}.
 */
export const ImageLinkButton: React.FC = () => {
  const formatter: ContentFormatter = useCallback(({ currentSelection, markdownContent }) => {
    return addLink(markdownContent, currentSelection, '!')
  }, [])
  return <ToolbarButton i18nKey={'imageLink'} icon={IconImage} formatter={formatter}></ToolbarButton>
}
