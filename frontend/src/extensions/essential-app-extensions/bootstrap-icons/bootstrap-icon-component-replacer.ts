/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isBootstrapIconName } from '../../../components/common/icons/bootstrap-icons'
import { LazyBootstrapIcon } from '../../../components/common/icons/lazy-bootstrap-icon'
import type { NodeReplacement } from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import { BootstrapIconMarkdownExtension } from './bootstrap-icon-markdown-extension'
import type { Element } from 'domhandler'
import React from 'react'

/**
 * Replaces a bootstrap icon tag with the bootstrap icon react component.
 *
 * @see BootstrapIcon
 */
export class BootstrapIconComponentReplacer extends ComponentReplacer {
  constructor() {
    super()
  }

  public replace(node: Element): NodeReplacement {
    const iconName = this.extractIconName(node)
    if (!iconName || !isBootstrapIconName(iconName)) {
      return DO_NOT_REPLACE
    }
    return React.createElement(LazyBootstrapIcon, { icon: iconName })
  }

  private extractIconName(element: Element): string | undefined {
    return element.name === BootstrapIconMarkdownExtension.tagName && element.attribs && element.attribs.id
      ? element.attribs.id
      : undefined
  }
}
