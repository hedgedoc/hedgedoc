/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'

export const getAttributesFromHedgeDocTag = (node: Element, tagName: string): { [s: string]: string } | undefined => {
  if (node.name !== `app-${tagName}` || !node.attribs) {
    return
  }
  return node.attribs
}
