/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Shows a static text placeholder while reveal.js is loading.
 */
export const LoadingSlide: React.FC = () => {
  useTranslation()
  return (
    <section>
      <h1>
        <Trans i18nKey={'common.loading'} />
      </h1>
    </section>
  )
}
