/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Transformer } from 'markmap-lib/dist/index.esm'
import { Markmap } from 'markmap-view'

const transformer: Transformer = new Transformer()

export const markmapLoader = (svg: SVGSVGElement, code: string): void => {
  const { root } = transformer.transform(code)
  Markmap.create(svg, {}, root)
}
