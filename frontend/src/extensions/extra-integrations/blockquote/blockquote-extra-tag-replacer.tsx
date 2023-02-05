/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { BootstrapIconName } from '../../../components/common/icons/bootstrap-icons'
import { isBootstrapIconName } from '../../../components/common/icons/bootstrap-icons'
import type { LazyBootstrapIconProps } from '../../../components/common/icons/lazy-bootstrap-icon'
import { LazyBootstrapIcon } from '../../../components/common/icons/lazy-bootstrap-icon'
import type {
  NodeReplacement,
  SubNodeTransform
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'
import { Optional } from '@mrdrogdrog/optional'
import type { Element } from 'domhandler'
import type { ReactElement } from 'react'

/**
 * Replaces <blockquote-tag> elements with an icon and a small text.
 *
 * @see BlockquoteTagMarkdownItPlugin
 * @see ColoredBlockquoteNodePreprocessor
 */
export class BlockquoteExtraTagReplacer extends ComponentReplacer {
  replace(element: Element, subNodeTransform: SubNodeTransform): NodeReplacement {
    return Optional.of(element)
      .filter(
        (element) => element.tagName === BlockquoteExtraTagMarkdownExtension.tagName && element.attribs !== undefined
      )
      .map((element) => (
        <span className={'blockquote-extra'} key={1}>
          {this.buildIconElement(element)}
          {BlockquoteExtraTagReplacer.transformChildren(element, subNodeTransform)}
        </span>
      ))
      .orElse(DO_NOT_REPLACE)
  }

  /**
   * Extracts an icon name from the node and builds a {@link LazyBootstrapIcon icon react element}.
   *
   * @param node The node that holds the "data-icon" attribute.
   * @return the {@link LazyBootstrapIcon icon react element} or {@link undefined} if no icon name was found.
   */
  private buildIconElement(node: Element): ReactElement<LazyBootstrapIconProps> | undefined {
    return Optional.ofNullable(node.attribs['data-icon'] as BootstrapIconName)
      .filter((iconName) => isBootstrapIconName(iconName))
      .map((iconName) => <LazyBootstrapIcon key='icon' className={'mx-1'} icon={iconName} />)
      .orElse(undefined)
  }
}
