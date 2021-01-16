/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DomElement } from 'domhandler'
import { ReactElement } from 'react'
import { ComponentReplacer, SubNodeTransform } from '../ComponentReplacer'

export class LinkInNewTabReplacer extends ComponentReplacer {
  public getReplacement (node: DomElement, subNodeTransform: SubNodeTransform): (ReactElement | null | undefined) {
    const isJumpMark = node.attribs?.href?.substr(0, 1) === '#'

    if (node.name !== 'a' || isJumpMark) {
      return undefined
    }

    return <a className={node.attribs?.class} title={node.attribs?.title} href={node.attribs?.href} rel='noopener noreferrer' target='_blank'>
      {
        node.children?.map((child, index) => subNodeTransform(child, index))
      }
    </a>
  }
}
