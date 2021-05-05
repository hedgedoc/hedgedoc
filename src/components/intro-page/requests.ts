/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultFetchConfig, expectResponseCode } from '../../api/utils'

export const fetchFrontPageContent = async (customizeAssetsUrl: string): Promise<string> => {
  const response = await fetch(customizeAssetsUrl + 'intro.md', {
    ...defaultFetchConfig,
    method: 'GET'
  })
  expectResponseCode(response)

  return await response.text()
}
