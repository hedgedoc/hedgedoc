/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'
import { parseQuoteExtraTag } from './quote-extra'

const cssColorRegex =
  /(#(?:[0-9a-f]{2}){2,4}|(?:#[0-9a-f]{3})|black|silver|gray|whitesmoke|maroon|red|purple|fuchsia|green|lime|olivedrab|yellow|navy|blue|teal|aquamarine|orange|aliceblue|antiquewhite|aqua|azure|beige|bisque|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|currentcolor|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|gainsboro|ghostwhite|goldenrod|gold|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavenderblush|lavender|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olive|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|rebeccapurple|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|transparent|turquoise|violet|wheat|white|yellowgreen)/i

export const quoteExtraColor: MarkdownIt.PluginSimple = (md) => {
  md.inline.ruler.push(`extraQuote_color`, (state) => {
    const quoteExtraTagValues = parseQuoteExtraTag(state.src, state.pos, state.posMax)

    if (!quoteExtraTagValues || quoteExtraTagValues.label !== 'color') {
      return false
    }
    state.pos = quoteExtraTagValues.valueEndIndex + 1

    if (!cssColorRegex.exec(quoteExtraTagValues.value)) {
      return false
    }

    state.pos = quoteExtraTagValues.valueEndIndex + 1

    const token = state.push('quote-extra-color', '', 0)
    token.attrSet('color', quoteExtraTagValues.value)

    return true
  })

  md.renderer.rules['quote-extra-color'] = (tokens, idx) => {
    const token = tokens[idx]
    const color = token.attrGet('color') ?? ''

    return `<span class="quote-extra" data-color='${color}' style='color: ${color}'><i class="fa fa-tag"></i></span>`
  }
}
