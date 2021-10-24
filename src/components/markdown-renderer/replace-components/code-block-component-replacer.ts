/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ValidReactDomElement } from './component-replacer'
import { ComponentReplacer } from './component-replacer'
import type { FunctionComponent } from 'react'
import React from 'react'
import type { Element } from 'domhandler'

export interface CodeProps {
  code: string
}

/**
 * Checks if the given checked node is a code block with a specific language attribute and creates an react-element that receives the code.
 */
export class CodeBlockComponentReplacer extends ComponentReplacer {
  constructor(private component: FunctionComponent<CodeProps>, private language: string) {
    super()
  }

  replace(node: Element): ValidReactDomElement | undefined {
    const code = CodeBlockComponentReplacer.extractTextFromCodeNode(node, this.language)
    return code ? React.createElement(this.component, { code: code }) : undefined
  }

  /**
   * Extracts the text content if the given {@link Element} is a code block with a specific language.
   *
   * @param element The {@link Element} to check.
   * @param language The language that code block should be assigned to.
   * @return The text content or undefined if the element isn't a code block or has the wrong language attribute.
   */
  public static extractTextFromCodeNode(element: Element, language: string): string | undefined {
    return element.name === 'code' && element.attribs['data-highlight-language'] === language && element.children[0]
      ? ComponentReplacer.extractTextChildContent(element)
      : undefined
  }
}
