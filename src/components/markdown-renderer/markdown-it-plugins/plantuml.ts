/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import plantuml from 'markdown-it-plantuml'
import type { Options } from 'markdown-it/lib'
import type MarkdownIt from 'markdown-it/lib'
import type { RenderRule } from 'markdown-it/lib/renderer'
import type Renderer from 'markdown-it/lib/renderer'
import type Token from 'markdown-it/lib/token'
import { store } from '../../../redux'
import type { MarkdownItPlugin } from '../replace-components/component-replacer'

export const plantumlWithError: MarkdownItPlugin = (markdownIt: MarkdownIt) => {
  const plantumlServer = store.getState().config.plantumlServer
  if (plantumlServer) {
    plantuml(markdownIt, {
      openMarker: '```plantuml',
      closeMarker: '```',
      server: plantumlServer
    })
  } else {
    plantumlError(markdownIt)
  }
}

const plantumlError: MarkdownIt.PluginSimple = (md) => {
  const defaultRenderer: RenderRule = md.renderer.rules.fence || (() => '')
  md.renderer.rules.fence = (tokens: Token[], idx: number, options: Options, env, slf: Renderer) => {
    const token = tokens[idx]
    if (token.info === 'plantuml') {
      return `
        <p class="alert alert-danger">
          PlantUML plugin is enabled but not properly configured.
        </p>
      `
    }
    return defaultRenderer(tokens, idx, options, env, slf)
  }
}
