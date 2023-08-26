/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { mapHtmlAttributesToReactElementAttributes } from './mapHtmlAttributesToReactElementAttributes.js'
import { convertInlineStyleToMap } from './convertInlineStyleToMap.js'

/**
 * Generates props for a React element from an object of HTML attributes
 *
 * @param {Object} attributes The HTML attributes
 * @param {String} key The key to give the react element
 */
export function generatePropsFromAttributes(
  attributes: Record<string, string>,
  key: string | number
): Record<string, string | Record<string, string>> {
  const props = Object.assign(
    { key },
    mapHtmlAttributesToReactElementAttributes(attributes)
  ) as Record<string, string | Record<string, string>>

  if (props.style) {
    if (typeof props.style === 'string') {
      props.style = convertInlineStyleToMap(props.style)
    }
  } else {
    delete props.style
  }

  return props
}
