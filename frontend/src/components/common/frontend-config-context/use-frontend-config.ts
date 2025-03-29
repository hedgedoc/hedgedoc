/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { FrontendConfigDto } from '@hedgedoc/commons'
import { frontendConfigContext } from './context'
import { Optional } from '@mrdrogdrog/optional'
import { useContext } from 'react'

/**
 * Retrieves the current frontend config from the next react context.
 */
export const useFrontendConfig = (): FrontendConfigDto => {
  return Optional.ofNullable(useContext(frontendConfigContext)).orElseThrow(
    () => new Error('No frontend config context found. Did you forget to use the provider component?')
  )
}
