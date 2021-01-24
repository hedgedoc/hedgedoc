/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DomElement } from 'domhandler'
import React, { ReactElement } from 'react'
import { ComponentReplacer, NativeRenderer, SubNodeTransform } from '../ComponentReplacer'

export const createJumpToMarkClickEventHandler = (id: string) => {
  return (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    document.getElementById(id)?.scrollIntoView()
    event.preventDefault()
  }
}

export class LinkReplacer extends ComponentReplacer {
  constructor (private baseUrl?: string) {
    super()
  }

  public getReplacement (node: DomElement, subNodeTransform: SubNodeTransform, nativeRenderer: NativeRenderer): (ReactElement | null | undefined) {
    if (node.name !== 'a' || !node.attribs || !node.attribs.href) {
      return undefined
    }

    const url = node.attribs.href
    const isJumpMark = url.substr(0, 1) === '#'

    const id = url.substr(1)

    try {
      node.attribs.href = new URL(url, this.baseUrl).toString()
    } catch (e) {
      node.attribs.href = url
    }

    if (isJumpMark) {
      return <span onClick={createJumpToMarkClickEventHandler(id)}>
        {nativeRenderer()}
      </span>
    } else {
      node.attribs.rel = "noreferer noopener"
      node.attribs.target = "_blank"
      return nativeRenderer()
    }
  }
}
