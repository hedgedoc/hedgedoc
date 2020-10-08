import MarkdownIt from 'markdown-it'
import markdownItRegex from 'markdown-it-regex'
import { RegexOptions } from '../../../external-types/markdown-it-regex/interface'

export const quoteExtra: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, replaceQuoteExtraAuthor)
  markdownItRegex(markdownIt, replaceQuoteExtraColor)
  markdownItRegex(markdownIt, replaceQuoteExtraTime)
}

const replaceQuoteExtraTime: RegexOptions = {
  name: 'quote-extra-time',
  regex: /\[time=([^\]]+)]/,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<span class="quote-extra"><i class="fa fa-clock-o mx-1"></i> ${match}</span>`
  }
}

const cssColorRegex = /\[color=(#(?:[0-9a-f]{2}){2,4}|(?:#[0-9a-f]{3})|black|silver|gray|whitesmoke|maroon|red|purple|fuchsia|green|lime|olivedrab|yellow|navy|blue|teal|aquamarine|orange|aliceblue|antiquewhite|aqua|azure|beige|bisque|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|currentcolor|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|gainsboro|ghostwhite|goldenrod|gold|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavenderblush|lavender|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olive|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|rebeccapurple|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|transparent|turquoise|violet|wheat|white|yellowgreen)]/i

const replaceQuoteExtraColor: RegexOptions = {
  name: 'quote-extra-color',
  regex: cssColorRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<span class="quote-extra" data-color='${match}' style='color: ${match}'><i class="fa fa-tag"></i></span>`
  }
}

const replaceQuoteExtraAuthor: RegexOptions = {
  name: 'quote-extra-name',
  regex: /\[name=([^\]]+)]/,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<span class="quote-extra"><i class="fa fa-user mx-1"></i> ${match}</span>`
  }
}
