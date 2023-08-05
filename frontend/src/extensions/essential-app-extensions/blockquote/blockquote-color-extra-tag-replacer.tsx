/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'
import { Optional } from '@mrdrogdrog/optional'
import type { Element } from 'domhandler'
import { isText } from 'domhandler'
import type { Text } from 'domhandler/lib/node'

/**
 * Replaces <blockquote-tag> elements with "color" as label and a valid color as content
 * with an colored label icon.
 *
 * @see BlockquoteTagMarkdownItPlugin
 */
export class BlockquoteColorExtraTagReplacer extends ComponentReplacer {
  replace(element: Element): NodeReplacement {
    return Optional.of(element)
      .filter(
        (element) =>
          element.tagName === BlockquoteExtraTagMarkdownExtension.tagName && element.attribs?.['data-label'] === 'color'
      )
      .map((element) => element.children[0])
      .filter(isText)
      .map((child) => <span key={1}>[color={(child as Text).data}]</span>)
      .orElse(DO_NOT_REPLACE)
  }
}
