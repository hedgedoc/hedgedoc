/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NativeRenderer, NodeReplacement, SubNodeTransform } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import type { Element } from 'domhandler'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { isText } from 'domhandler'
import { cssColor } from './blockquote-border-color-node-preprocessor'
import Optional from 'optional-js'
import type { Text } from 'domhandler/lib/node'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'

/**
 * Replaces <blockquote-tag> elements with "color" as label and a valid color as content
 * with an colored label icon.
 *
 * @see BlockquoteTagMarkdownItPlugin
 */
export class BlockquoteColorExtraTagReplacer extends ComponentReplacer {
  replace(element: Element, subNodeTransform: SubNodeTransform, nativeRenderer: NativeRenderer): NodeReplacement {
    if (
      element.tagName === BlockquoteExtraTagMarkdownExtension.tagName &&
      element.attribs?.['data-label'] === 'color' &&
      element.children !== undefined
    ) {
      return Optional.ofNullable(element.children[0])
        .filter(isText)
        .map((child) => (child as Text).data)
        .filter((content) => cssColor.test(content))
        .map<NodeReplacement>((color) => (
          <span className={'blockquote-extra'} style={{ color: color }}>
            <ForkAwesomeIcon key='icon' className={'mx-1'} icon={'tag'} />
          </span>
        ))
        .orElse(DO_NOT_REPLACE)
    }
  }
}
