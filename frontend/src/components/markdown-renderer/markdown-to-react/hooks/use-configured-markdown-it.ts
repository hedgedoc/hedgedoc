/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MarkdownRendererExtension } from '../../extensions/_base-classes/markdown-renderer-extension'
import MarkdownIt from 'markdown-it/lib'
import { useMemo } from 'react'

/**
 * Creates a new {@link MarkdownIt markdown-it instance} and configures it using the given {@link MarkdownRendererExtension markdown renderer extensions}.
 *
 * @param extensions The extensions that configure the new markdown-it instance
 * @param allowHtml Defines if html in markdown is allowed
 * @param newlinesAreBreaks Defines if new lines should be treated as line breaks or paragraphs
 * @return the created markdown-it instance
 */
export const useConfiguredMarkdownIt = (
  extensions: MarkdownRendererExtension[],
  allowHtml: boolean,
  newlinesAreBreaks: boolean
): MarkdownIt => {
  return useMemo(() => {
    const newMarkdownIt = new MarkdownIt('default', {
      html: allowHtml,
      breaks: newlinesAreBreaks,
      langPrefix: '',
      typographer: true
    })
    extensions.forEach((extension) => newMarkdownIt.use((markdownIt) => extension.configureMarkdownIt(markdownIt)))
    extensions.forEach((extension) => newMarkdownIt.use((markdownIt) => extension.configureMarkdownItPost(markdownIt)))
    return newMarkdownIt
  }, [allowHtml, extensions, newlinesAreBreaks])
}
