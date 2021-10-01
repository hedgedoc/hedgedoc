/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Element } from 'domhandler'
import React from 'react'
import { ComponentReplacer, NativeRenderer, SubNodeTransform, ValidReactDomElement } from '../ComponentReplacer'

export const createJumpToMarkClickEventHandler = (id: string) => {
  return (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    document.getElementById(id)?.scrollIntoView()
    event.preventDefault()
  }
}

/**
 * Detects link tags and polishs them.
 * This replacer prevents data and javascript links,
 * extends relative links with the base url and creates working jump links.
 */
export class LinkReplacer extends ComponentReplacer {
  constructor(private baseUrl?: string) {
    super()
  }

  public getReplacement(
    node: Element,
    subNodeTransform: SubNodeTransform,
    nativeRenderer: NativeRenderer
  ): ValidReactDomElement | undefined {
    if (node.name !== 'a' || !node.attribs || !node.attribs.href) {
      return undefined
    }

    const url = node.attribs.href.trim()

    // eslint-disable-next-line no-script-url
    if (url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('vbscript:')) {
      return <span>{node.attribs.href}</span>
    }

    const isJumpMark = url.substr(0, 1) === '#'

    const id = url.substr(1)

    try {
      node.attribs.href = new URL(url, this.baseUrl).toString()
    } catch (e) {
      node.attribs.href = url
    }

    if (isJumpMark) {
      return <span onClick={createJumpToMarkClickEventHandler(id)}>{nativeRenderer()}</span>
    } else {
      node.attribs.rel = 'noreferer noopener'
      node.attribs.target = '_blank'
      return nativeRenderer()
    }
  }
}
