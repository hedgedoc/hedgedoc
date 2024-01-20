/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TableOfContents } from '../../../editor-page/table-of-contents/table-of-contents'
import { TableOfContentsHoveringButton } from '../../markdown-toc-button/table-of-contents-hovering-button'
import { ORIGIN, useBaseUrl } from '../../../../hooks/common/use-base-url'
import type { TocAst } from '@hedgedoc/markdown-it-plugins'
import React from 'react'

export interface DocumentExternalTocProps {
  tocAst: TocAst
  width: number
}

const MAX_WIDTH_FOR_BUTTON_VISIBILITY = 1100

/**
 * Renders the {@link TableOfContents table of contents list} for the given {@link TocAst AST}.
 * If the given width is below {@link MAX_WIDTH_FOR_BUTTON_VISIBILITY the width limit} then a {@link TableOfContentsHoveringButton button} with an overlay will be shown instead.
 *
 * @param tocAst the {@link TocAst AST} that should be rendered.
 * @param width the width that should be used to determine if the button should be shown.
 */
export const WidthBasedTableOfContents: React.FC<DocumentExternalTocProps> = ({ tocAst, width }) => {
  const rendererBaseUrl = useBaseUrl(ORIGIN.RENDERER)

  if (width >= MAX_WIDTH_FOR_BUTTON_VISIBILITY) {
    return <TableOfContents ast={tocAst} baseUrl={rendererBaseUrl} />
  } else {
    return <TableOfContentsHoveringButton tocAst={tocAst} baseUrl={rendererBaseUrl} />
  }
}
