/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NodeReplacement } from '../../replace-components/component-replacer'
import { ComponentReplacer, DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import type { Element } from 'domhandler'
import { isText } from 'domhandler'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { cssColor } from './blockquote-border-color-node-preprocessor'
import type { Text } from 'domhandler/lib/node'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'
import { Optional } from '@mrdrogdrog/optional'

/**
 * Replaces <blockquote-tag> elements with "color" as label and a valid color as content
 * with an colored label icon.
 *
 * @see BlockquoteTagMarkdownItPlugin
 */
export class BlockquoteColorExtraTagReplacer extends ComponentReplacer {
  replace(element: Element): NodeReplacement {
    if (
      element.tagName === BlockquoteExtraTagMarkdownExtension.tagName &&
      element.attribs?.['data-label'] === 'color' &&
      element.children !== undefined
    ) {
      let index = 0
      return Optional.ofNullable(element.children[0])
        .filter(isText)
        .map((child) => (child as Text).data)
        .filter((content) => cssColor.test(content))
        .map((color) => (
          <span className={'blockquote-extra'} key={(index += 1)} style={{ color: color }}>
            <ForkAwesomeIcon key='icon' className={'mx-1'} icon={'tag'} />
          </span>
        ))
        .orElse(DO_NOT_REPLACE)
    }
  }
}
