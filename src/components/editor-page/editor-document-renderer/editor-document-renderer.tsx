/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import type { RenderIframeProps } from '../renderer-pane/render-iframe'
import { RenderIframe } from '../renderer-pane/render-iframe'
import { useSendFrontmatterInfoFromReduxToRenderer } from '../renderer-pane/hooks/use-send-frontmatter-info-from-redux-to-renderer'
import { useTrimmedNoteMarkdownContentWithoutFrontmatter } from '../../../hooks/common/use-trimmed-note-markdown-content-without-frontmatter'
import { NoteType } from '../../../redux/note-details/types/note-details'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { RendererType } from '../../render-page/window-post-message-communicator/rendering-message'
import { useSetCheckboxInEditor } from './hooks/use-set-checkbox-in-editor'

export type EditorDocumentRendererProps = Omit<
  RenderIframeProps,
  'markdownContentLines' | 'rendererType' | 'onTaskCheckedChange'
>

/**
 * Renders the markdown content from the global application state with the iframe renderer.
 *
 * @param props Every property from the {@link RenderIframe} except the markdown content.
 */
export const EditorDocumentRenderer: React.FC<EditorDocumentRendererProps> = (props) => {
  useSendFrontmatterInfoFromReduxToRenderer()
  const trimmedContentLines = useTrimmedNoteMarkdownContentWithoutFrontmatter()
  const noteType: NoteType = useApplicationState((state) => state.noteDetails.frontmatter.type)
  const setCheckboxInEditor = useSetCheckboxInEditor()

  return (
    <RenderIframe
      {...props}
      onTaskCheckedChange={setCheckboxInEditor}
      rendererType={noteType === NoteType.SLIDE ? RendererType.SLIDESHOW : RendererType.DOCUMENT}
      markdownContentLines={trimmedContentLines}
    />
  )
}
