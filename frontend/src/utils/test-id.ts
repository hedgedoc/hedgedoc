/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface PropsWithDataTestId {
  'data-testid'?: string | undefined
}

/**
 * Returns an object with the "data-testid" attribute that is used to find
 * elements in unit tests.
 * This works only if the runtime is built in test mode.
 *
 * @param identifier The identifier that is used to find the element
 * @return An object if in test mode, undefined otherwise.
 */
export const testId = (identifier: string): PropsWithDataTestId => {
  return process.env.NODE_ENV === 'test' ? { 'data-testid': identifier } : {}
}
