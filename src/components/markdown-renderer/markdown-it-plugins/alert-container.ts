/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import Renderer from 'markdown-it/lib/renderer'
import Token from 'markdown-it/lib/token'
import { MarkdownItPlugin } from '../replace-components/ComponentReplacer'

export type RenderContainerReturn = (tokens: Token[], index: number, options: MarkdownIt.Options, env: unknown, self: Renderer) => string;
type ValidAlertLevels = ('warning' | 'danger' | 'success' | 'info')
export const validAlertLevels: ValidAlertLevels[] = ['success', 'danger', 'info', 'warning']

const createRenderContainer = (level: ValidAlertLevels): RenderContainerReturn => {
  return (tokens: Token[], index: number, options: MarkdownIt.Options, env: unknown, self: Renderer) => {
    tokens[index].attrJoin('role', 'alert')
    tokens[index].attrJoin('class', 'alert')
    tokens[index].attrJoin('class', `alert-${level}`)
    return self.renderToken(tokens, index, options)
  }
}

export const alertContainer: MarkdownItPlugin = (markdownIt: MarkdownIt) => {
  validAlertLevels.forEach(level => {
    markdownItContainer(markdownIt, level, { render: createRenderContainer(level) })
  })
}
