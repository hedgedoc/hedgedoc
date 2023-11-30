/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import booleanAttributes from '../dom/attributes/booleanAttributes.js'
import reactAttributes from '../dom/attributes/reactAttributes.js'
import { isValidTagOrAttributeName } from './isValidTagOrAttributeName.js'

/**
 * Returns the parsed attribute value taking into account things like boolean attributes
 *
 * @param {string} attribute The name of the attribute
 * @param {string} value The value of the attribute from the HTML
 * @returns {string} The parsed attribute value
 */
function getParsedAttributeValue(attribute: string, value: string): string {
  if (booleanAttributes.has(attribute.toLowerCase())) {
    value = attribute
  }
  return value
}

/**
 * Don't pass through event handler attributes at all (on...)
 * This is the same heuristic used by React:
 * https://github.com/facebook/react/blob/7a5b8227c7/packages/react-dom/src/shared/ReactDOMUnknownPropertyHook.js#L23
 * @param {string} attribute The attribute name to check
 */
function isEventHandlerAttribute(attribute: string): boolean {
  return attribute.startsWith('on')
}

/**
 * Takes an object of standard HTML property names and converts them to their React counterpart. If the react
 * version does not exist for an attribute then just use it as it is
 *
 * @param {Object} attributes The HTML attributes to convert
 * @returns {Object} The React attributes
 */
export function mapHtmlAttributesToReactElementAttributes(
  attributes: Record<string, string>
): Record<string, string> {
  return Object.keys(attributes)
    .filter(
      (attribute) =>
        !isEventHandlerAttribute(attribute) &&
        isValidTagOrAttributeName(attribute)
    )
    .reduce<Record<string, string>>((mappedAttributes, attribute) => {
      // lowercase the attribute name and find it in the react attribute map
      const lowerCaseAttribute = attribute.toLowerCase()

      // format the attribute name
      const name = reactAttributes[lowerCaseAttribute] || attribute

      // add the parsed attribute value to the mapped attributes
      mappedAttributes[name] = getParsedAttributeValue(
        name,
        attributes[attribute]
      )

      return mappedAttributes
    }, {})
}
