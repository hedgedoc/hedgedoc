/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import Head from 'next/head'
import { useAppTitle } from '../../hooks/common/use-app-title'
import { FavIcon } from './fav-icon'

/**
 * Sets basic browser meta tags.
 */
export const BaseHead: React.FC = () => {
  const appTitle = useAppTitle()

  return (
    <Head>
      <title>{appTitle}</title>
      <FavIcon />
      <meta content='width=device-width, initial-scale=1' name='viewport' />
    </Head>
  )
}
