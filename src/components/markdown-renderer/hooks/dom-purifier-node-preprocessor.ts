/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Document } from 'domhandler'
import render from 'dom-serializer'
import DOMPurify from 'dompurify'
import { parseDocument } from 'htmlparser2'

const customTags = ['app-linemarker', 'app-katex', 'app-gist', 'app-youtube', 'app-vimeo', 'app-asciinema']

/**
 * Sanitizes the given {@link Document document}.
 *
 * @param document The dirty document
 * @return the sanitized Document
 */
export const domPurifierNodePreprocessor = (document: Document): Document => {
  const sanitizedHtml = DOMPurify.sanitize(render(document), {
    ADD_TAGS: customTags
  })
  return parseDocument(sanitizedHtml)
}
