/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const isTestMode = (): boolean => {
  return !!process.env.REACT_APP_TEST_MODE
}
