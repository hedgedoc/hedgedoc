/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { RenderIframe, RenderIframeProps } from '../renderer-pane/render-iframe'
import { useNoteMarkdownContentWithoutFrontmatter } from '../../../hooks/common/use-note-markdown-content-without-frontmatter'
import { useSendFrontmatterInfoFromReduxToRenderer } from '../renderer-pane/hooks/use-send-frontmatter-info-from-redux-to-renderer'

export type EditorDocumentRendererProps = Omit<RenderIframeProps, 'markdownContent'>

/**
 * Renders the markdown content from the global application state with the iframe renderer.
 *
 * @param props Every property from the {@link RenderIframe} except the markdown content.
 */
export const EditorDocumentRenderer: React.FC<EditorDocumentRendererProps> = (props) => {
  const markdownContent = useNoteMarkdownContentWithoutFrontmatter()

  useSendFrontmatterInfoFromReduxToRenderer()

  return <RenderIframe frameClasses={'h-100 w-100'} markdownContent={markdownContent} {...props} />
}
