/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: MIT
 */

import { TocAst } from './toc-ast.js'

export type TocOptions = {
  slugify: (name: string, index: number) => string
  uniqueSlugStartIndex: number
  containerClass: string
  containerId: string
  listClass: string
  itemClass: string
  linkClass: string
  level: number | number[]
  listType: 'ol' | 'ul'
  format?: (name: string) => string
  callback?: (ast: TocAst) => void
  allowedTokenTypes: string[]
}

function defaultSlugify(name: string) {
  return encodeURIComponent(String(name).trim().toLowerCase().replace(/\s+/g, '-'))
}

/**
 * The default options for the toc plugin.
 */
export const defaultOptions: TocOptions = {
  uniqueSlugStartIndex: 0,
  containerClass: 'table-of-contents',
  containerId: '',
  listClass: '',
  itemClass: '',
  linkClass: '',
  level: 1,
  listType: 'ol',
  allowedTokenTypes: ['text', 'code_inline'],
  slugify: defaultSlugify
}
