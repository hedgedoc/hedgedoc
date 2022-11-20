/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getConfig } from '../../../api/config'
import { setConfig } from '../../../redux/config/methods'

/**
 * Get the {@link Config frontend config} and save it in the global application state.
 */
export const fetchFrontendConfig = async (): Promise<void> => {
  const config = await getConfig()
  if (!config) {
    return Promise.reject(new Error('Config empty!'))
  }
  setConfig(config)
}
