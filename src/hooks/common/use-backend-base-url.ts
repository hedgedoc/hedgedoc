/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const useBackendBaseUrl = (): string => {
  return process.env.REACT_APP_BACKEND_BASE_URL ?? '/mock-backend/'
}
