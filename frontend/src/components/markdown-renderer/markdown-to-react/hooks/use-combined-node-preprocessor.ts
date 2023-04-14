/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../extensions/_base-classes/markdown-renderer-extension'
import type { Document } from 'domhandler'
import { useMemo } from 'react'

/**
 * Creates a function that applies the node preprocessors of every given {@link MarkdownRendererExtension} to a {@link Document}.
 *
 * @param extensions The extensions who provide node processors
 * @return The created apply function
 */
export const useCombinedNodePreprocessor = (extensions: MarkdownRendererExtension[]): ((nodes: Document) => Document) =>
  useMemo(() => {
    return extensions
      .flatMap((extension) => extension.buildNodeProcessors())
      .reduce(
        (state, processor) => (document: Document) => state(processor.process(document)),
        (document: Document) => document
      )
  }, [extensions])
