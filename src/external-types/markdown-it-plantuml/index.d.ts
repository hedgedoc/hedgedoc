/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-plantuml' {
  import MarkdownIt from 'markdown-it/lib'
  import { PlantumlOptions } from './interface'
  const markdownItPlantuml: MarkdownIt.PluginWithOptions<PlantumlOptions>
  export = markdownItPlantuml
}
