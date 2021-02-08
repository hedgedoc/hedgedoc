/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultFetchConfig, expectResponseCode } from '../../api/utils'

export const getFrontPageContent = async (baseUrl: string): Promise<string> => {
  const response = await fetch(baseUrl + '/intro.md', {
    ...defaultFetchConfig,
    method: 'GET'
  })
  expectResponseCode(response)

  return await response.text()
}
