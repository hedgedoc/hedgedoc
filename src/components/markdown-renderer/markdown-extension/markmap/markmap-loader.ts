/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Transformer } from 'markmap-lib/dist/index.esm'
import { Markmap } from 'markmap-view'

const transformer: Transformer = new Transformer()

/**
 * Renders the given markdown code into the given Dom element using {@link Markmap markmap}.
 *
 * @param svg The dom element to render into.
 * @param code The diagram code.
 */
export const markmapLoader = (svg: SVGSVGElement, code: string): void => {
  const { root } = transformer.transform(code)
  Markmap.create(svg, {}, root)
}
