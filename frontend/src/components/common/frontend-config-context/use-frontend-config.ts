/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfig } from '../../../api/config/types'
import { frontendConfigContext } from './context'
import { Optional } from '@mrdrogdrog/optional'
import { useContext } from 'react'

/**
 * Retrieves the current frontend config from the next react context.
 */
export const useFrontendConfig = (): FrontendConfig => {
  return Optional.ofNullable(useContext(frontendConfigContext)).orElseThrow(
    () => new Error('No frontend config context found. Did you forget to use the provider component?')
  )
}
