/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomElement } from 'domhandler'

export const getAttributesFromHedgeDocTag = (node: DomElement, tagName: string): ({ [s: string]: string; }|undefined) => {
  if (node.name !== `app-${tagName}` || !node.attribs) {
    return
  }
  return node.attribs
}
