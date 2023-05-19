/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

type ClassMap = Record<string, boolean | null | undefined>

/**
 * Generates a css class string from the given arguments. It filters out empty values, as well as null and undefined.
 * If one of the arguments is a string to boolean map then only the keys with a true-ish value will be included.
 *
 * @param values The values that should be included in the class name string
 * @return {string} the generates class name string
 */
export const concatCssClasses = (...values: (string | null | undefined | ClassMap)[]): string => {
  const strings = generateCssClassStrings(values).filter((value) => !!value)
  return Array.from(new Set(strings)).join(' ')
}
const generateCssClassStrings = (values: (string | null | undefined | ClassMap)[]): string[] => {
  if (Array.isArray(values)) {
    return values.flatMap((value) => {
      if (!value) {
        return []
      } else if (typeof value === 'string') {
        return [value]
      } else {
        return generateCssClassStringsFromMap(value)
      }
    })
  } else {
    return generateCssClassStringsFromMap(values)
  }
}

const generateCssClassStringsFromMap = (values: ClassMap): string[] => {
  return Object.keys(values).filter((value) => values[value])
}
