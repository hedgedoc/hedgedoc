/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isTestMode } from './test-modes'

export interface PropsWithDataCypressId {
  'data-cypress-id'?: string | undefined
}

/**
 * Returns an object with the "data-cypress-id" attribute that is used to find
 * elements for integration tests.
 * This works only if the runtime is built in test mode.
 *
 * @param identifier The identifier that is used to find the element
 * @return An object if in test mode, {@link undefined} otherwise.
 */
export const cypressId = (identifier: string | undefined | PropsWithDataCypressId): PropsWithDataCypressId => {
  if (!isTestMode || !identifier) {
    return {}
  }

  const attributeContent = typeof identifier === 'string' ? identifier : identifier['data-cypress-id']

  return attributeContent !== undefined ? { 'data-cypress-id': attributeContent } : {}
}

/**
 * Returns an object with an attribute that starts with "data-cypress-" and the given attribute name.
 * It is used to check additional data during integration tests.
 * This works only if the runtime is built in test mode.
 *
 * @param attribute The attribute name
 * @param value The attribute content
 * @return An object if in test mode, undefined otherwise.
 */
export const cypressAttribute = (
  attribute: string,
  value: string | undefined
): Record<string, string | undefined> | undefined => {
  if (!isTestMode) {
    return
  }

  return {
    [`data-cypress-${attribute}`]: value
  }
}
