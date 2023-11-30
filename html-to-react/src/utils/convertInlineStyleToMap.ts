/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Converts an inline style string into an object of React style properties
 *
 * @param {String} inlineStyle='' The inline style to convert
 * @returns {Object} The converted style
 */
export function convertInlineStyleToMap(
  inlineStyle = ''
): Record<string, string> {
  if (inlineStyle === '') {
    return {}
  }

  return inlineStyle
    .split(';')
    .reduce<Record<string, string>>((styleObject, stylePropertyValue) => {
      // extract the style property name and value
      const [property, value] = stylePropertyValue
        .split(/^([^:]+):/)
        .filter((val, i) => i > 0)
        .map((item) => item.trim())

      // if there is no value (i.e. no : in the style) then ignore it
      if (value === undefined) {
        return styleObject
      }

      // convert the property name into the correct React format
      // remove all hyphens and convert the letter immediately after each hyphen to upper case
      // additionally don't uppercase any -ms- prefix
      // e.g. -ms-style-property = msStyleProperty
      //      -webkit-style-property = WebkitStyleProperty
      const replacedProperty = property
        .toLowerCase()
        .replace(/^-ms-/, 'ms-')
        .replace(/-(.)/g, (_, character: string) => character.toUpperCase())

      // add the new style property and value to the style object
      styleObject[replacedProperty] = value

      return styleObject
    }, {})
}
