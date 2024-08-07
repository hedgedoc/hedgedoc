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

  const statements: string[] = []
  let i = -1
  let offset = 0
  do {
    i++
    let curr = inlineStyle[i]
    let prev = inlineStyle[i - 1]

    if ((curr === "'" || curr === '"') && prev !== '\\') {
      const quote = curr
      do {
        i++
        curr = inlineStyle[i]
        prev = inlineStyle[i - 1]
      } while (!(curr === quote && prev !== '\\') && i < inlineStyle.length)
      continue
    }

    if (curr === ';' && prev !== '\\') {
      statements.push(inlineStyle.slice(offset, i))
      offset = i + 1
      continue
    }
  } while (i < inlineStyle.length)
  statements.push(inlineStyle.slice(offset, inlineStyle.length))

  return statements.reduce<Record<string, string>>(
    (styleObject, stylePropertyValue) => {
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
      const replacedProperty = property.startsWith('--')
        ? property
        : property
            .toLowerCase()
            .replace(/^-ms-/, 'ms-')
            .replace(/-(.)/g, (_, character: string) => character.toUpperCase())

      // add the new style property and value to the style object
      styleObject[replacedProperty] = value

      return styleObject
    },
    {}
  )
}
