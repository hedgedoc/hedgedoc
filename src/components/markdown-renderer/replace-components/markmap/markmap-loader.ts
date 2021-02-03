/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import { loadCSS, loadJS } from 'markmap-common'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'

const transformer: Transformer = new Transformer()

export const markmapLoader = (svg: SVGSVGElement, code: string): void => {
  const { root, features } = transformer.transform(code)
  const { styles, scripts } = transformer.getUsedAssets(features)

  if (styles) {
    loadCSS(styles)
  }
  if (scripts) {
    loadJS(scripts)
      .catch(console.log)
  }

  Markmap.create(svg, {}, root)
}
