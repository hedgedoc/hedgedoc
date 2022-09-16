/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import Head from 'next/head'
import { useAppTitle } from '../../hooks/common/use-app-title'
import { FavIcon } from './fav-icon'
import { useBaseUrl } from '../../hooks/common/use-base-url'

/**
 * Sets basic browser meta tags.
 */
export const BaseHead: React.FC = () => {
  const appTitle = useAppTitle()
  const baseUrl = useBaseUrl()
  return (
    <Head>
      <title>{appTitle}</title>
      <FavIcon />
      <base href={baseUrl} />
      <meta content='width=device-width, initial-scale=1' name='viewport' />
    </Head>
  )
}
