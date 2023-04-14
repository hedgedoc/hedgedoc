/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TravelerNodeProcessor } from '../../../components/markdown-renderer/node-preprocessors/traveler-node-processor'
import { BlockquoteExtraTagMarkdownExtension } from './blockquote-extra-tag-markdown-extension'
import { Optional } from '@mrdrogdrog/optional'
import type { Element, Node } from 'domhandler'
import { isTag, isText } from 'domhandler'

/**
 * Detects blockquotes with blockquote color tags and uses them to color the blockquote border.
 */
export class BlockquoteBorderColorNodePreprocessor extends TravelerNodeProcessor {
  protected processNode(node: Node): void {
    if (!isTag(node) || isBlockquoteWithChildren(node)) {
      return
    }

    Optional.ofNullable(findBlockquoteColorDefinitionAndParent(node.children)).ifPresent(([color, parentParagraph]) => {
      removeColorDefinitionsFromParagraph(parentParagraph)
      if (!cssColor.test(color)) {
        return
      }
      setLeftBorderColor(node, color)
    })
  }
}

export const cssColor =
  /^(#(?:[0-9a-f]{2}){2,4}|#[0-9a-f]{3}|black|silver|gray|whitesmoke|maroon|red|purple|fuchsia|green|lime|olivedrab|yellow|navy|blue|teal|aquamarine|orange|aliceblue|antiquewhite|aqua|azure|beige|bisque|blanchedalmond|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|currentcolor|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|gainsboro|ghostwhite|goldenrod|gold|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavenderblush|lavender|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|limegreen|linen|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|oldlace|olive|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|rebeccapurple|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|thistle|tomato|transparent|turquoise|violet|wheat|white|yellowgreen)$/i

/**
 * Checks if the given {@link Element} is a blockquote with children.
 *
 * @param element The {@link Element} to check
 * @return {@link true} if the element is a blockquote with children.
 */
const isBlockquoteWithChildren = (element: Element): boolean => {
  return element.name !== 'blockquote' || !element.children || element.children.length < 1
}

/**
 * Searches for a blockquote color definition tag.
 *
 * @param elements The {@link Element} elements that should be searched through.
 * @return The parent paragraph and the extracted color if a color definition was found. {@link undefined} otherwise.
 */
const findBlockquoteColorDefinitionAndParent = (
  elements: Node[]
): [color: string, parentParagraph: Element] | undefined => {
  for (const paragraph of elements) {
    if (!isTag(paragraph) || paragraph.name !== 'p' || paragraph.children.length === 0) {
      continue
    }

    for (const colorDefinition of paragraph.children) {
      if (!isTag(colorDefinition)) {
        continue
      }

      const content = extractBlockquoteColorDefinition(colorDefinition)
      if (content !== undefined) {
        return [content, paragraph]
      }
    }
  }
}

/**
 * Checks if the given node is a blockquote color definition.
 *
 * @param element The {@link Element} to check
 * @return true if the checked node is a blockquote color definition
 */
const extractBlockquoteColorDefinition = (element: Element): string | undefined => {
  if (
    element.name === BlockquoteExtraTagMarkdownExtension.tagName &&
    element.attribs['data-label'] === 'color' &&
    element.children.length === 1 &&
    isText(element.children[0])
  ) {
    return element.children[0].data
  }
}

/**
 * Removes all color definition elements from the given paragraph {@link Element}.
 *
 * @param paragraph The {@link Element} whose children should be filtered
 */
const removeColorDefinitionsFromParagraph = (paragraph: Element): void => {
  const childElements = paragraph.children
  paragraph.children = childElements.filter((elem) => !isTag(elem) || !extractBlockquoteColorDefinition(elem))
}

/**
 * Sets the left border color of the given {@link Element}.
 *
 * @param element The {@link Element} to change
 * @param color The border color
 */
const setLeftBorderColor = (element: Element, color: string): void => {
  element.attribs = Object.assign(element.attribs || {}, { style: `border-left-color: ${color};` })
}
