/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetExtension } from '../../../components/cheatsheet/cheatsheet-extension'
import {
  basicCompletion,
  codeFenceRegex
} from '../../../components/editor-page/editor-pane/autocompletions/basic-completion'
import type { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { AppExtension } from '../../_base-classes/app-extension'
import { buildNodeBookInBlockCompletions } from '@nodebook/react'
import { CnlInsertHandler } from './cnl-insert-handler'
import { NodeBookMarkdownExtension } from './nodebook-markdown-extension'
import type { CompletionSource } from '@codemirror/autocomplete'
import type React from 'react'

/**
 * Adds support for nodeBook knowledge graph rendering to the markdown renderer.
 * Users write CNL (Controlled Natural Language) inside a nodeBook code fence,
 * and HedgeDoc renders an interactive knowledge graph inline.
 */
export class NodeBookAppExtension extends AppExtension {
  buildMarkdownRendererExtensions(): MarkdownRendererExtension[] {
    return [new NodeBookMarkdownExtension()]
  }

  buildEditorExtensionComponent(): React.FC {
    return CnlInsertHandler
  }

  buildCheatsheetExtensions(): CheatsheetExtension[] {
    return [
      {
        i18nKey: 'nodeBook',
        categoryI18nKey: 'charts',
        topics: [
          { i18nKey: 'conceptMap' },
          { i18nKey: 'petriNet' },
          { i18nKey: 'accounting' },
          { i18nKey: 'mindMap' },
          { i18nKey: 'morphs' },
          { i18nKey: 'negation' },
          { i18nKey: 'queries' }
        ]
      },
      { i18nKey: 'nodeBook-schema', categoryI18nKey: 'charts' },
      { i18nKey: 'nodeBook-analyze', categoryI18nKey: 'charts' }
    ]
  }

  buildAutocompletion(): CompletionSource[] {
    return [
      ...buildNodeBookInBlockCompletions(),
      basicCompletion(codeFenceRegex, '```nodeBook\n# Node Name [Type]\nattribute: value;\n<relation> Target;\n```'),
      basicCompletion(
        codeFenceRegex,
        '```nodeBook\n# Process [Transition]\n<has prior_state> 2 Input;\n<has post_state> Output;\n```'
      ),
      basicCompletion(
        codeFenceRegex,
        '```nodeBook\n# Cash [Asset]\nbalance: 10000;\n\n# Buy Inventory [Transaction]\ndate: 2026-01-15;\n<debit> 5000 Inventory;\n<credit> 5000 Cash;\n```'
      ),
      basicCompletion(
        codeFenceRegex,
        '```nodeBook\n# Central Topic <relation>\n- Branch 1\n  - Sub-branch 1\n  - Sub-branch 2\n- Branch 2\n```'
      ),
      basicCompletion(
        codeFenceRegex,
        '```nodeBook\n# Socrates [individual]\n<member_of> Greek;\n<member_of> what;\n\n# Greek [class]\n<is_a> Human;\n\n# Human [class]\n<is_a> Mortal;\n\n# Mortal [class]\n\nwho <is_a> Mortal;\n```'
      ),
      basicCompletion(
        codeFenceRegex,
        '```nodeBook-schema\nnodeType: Planet, A celestial body, parent: Object\nrelationType: orbits, One body orbits another, domain: Planet, range: Star\nattributeType: diameter, float, Size measurement, unit: km, domain: Planet\n```'
      ),
      basicCompletion(
        codeFenceRegex,
        '```nodeBook-analyze\nPaste a paragraph from your textbook here. Select annotation categories\nfrom the toolbar to see which parts of the text map to graph elements\nlike nodes, relations, adjectives, and more.\n```'
      )
    ]
  }
}
