/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomElement } from 'domhandler'
import MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import React from 'react'
import { ComponentReplacer } from '../ComponentReplacer'
import { getAttributesFromHedgeDocTag } from '../utils'
import { AsciinemaFrame } from './asciinema-frame'
import { replaceAsciinemaLink } from './replace-asciinema-link'

export class AsciinemaReplacer extends ComponentReplacer {
  public static readonly markdownItPlugin: MarkdownIt.PluginSimple = (markdownIt) => {
    markdownItRegex(markdownIt, replaceAsciinemaLink)
  }

  public getReplacement(node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromHedgeDocTag(node, 'asciinema')
    if (attributes && attributes.id) {
      const asciinemaId = attributes.id
      return <AsciinemaFrame id={asciinemaId} />
    }
  }
}
