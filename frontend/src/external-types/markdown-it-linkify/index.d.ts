/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it/lib/rules_core/linkify' {
  import type { RuleCore } from 'markdown-it/lib/parser_core'
  const markdownItLinkify: RuleCore
  export = markdownItLinkify
}
