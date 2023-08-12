/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'

/**
 * Sets meta tags for the favicon.
 */
export const FavIcon: React.FC = () => {
  return (
    <Fragment>
      <link href='/icons/apple-touch-icon.png' rel='apple-touch-icon' sizes='180x180' />
      <link href='/icons/favicon-32x32.png' rel='icon' sizes='32x32' type='image/png' />
      <link href='/icons/favicon-16x16.png' rel='icon' sizes='16x16' type='image/png' />
      <link href='/icons/site.webmanifest' rel='manifest' />
      <link href='/icons/favicon.ico' rel='shortcut icon' />
      <link color='#b51f08' href='/icons/safari-pinned-tab.svg' rel='mask-icon' />
      <meta name='apple-mobile-web-app-title' content='HedgeDoc' />
      <meta name='application-name' content='HedgeDoc' />
      <meta name='msapplication-TileColor' content='#b51f08' />
      <meta name='theme-color' content='#b51f08' />
      <meta content='/icons/browserconfig.xml' name='msapplication-config' />
      <meta content='HedgeDoc - Collaborative markdown notes' name='description' />
    </Fragment>
  )
}
