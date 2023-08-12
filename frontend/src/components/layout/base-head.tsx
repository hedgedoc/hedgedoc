/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAppTitle } from '../../hooks/common/use-app-title'
import { FavIcon } from './fav-icon'
import Head from 'next/head'
import React from 'react'

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
