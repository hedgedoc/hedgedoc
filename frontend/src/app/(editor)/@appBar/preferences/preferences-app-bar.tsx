'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BaseAppBar } from '../../../../components/layout/app-bar/base-app-bar'

/**
 * Shows the app bar with common "Preferences" title for every preferences tab.
 */
export const PreferencesAppBar: React.FC = () => {
  useTranslation()

  return (
    <BaseAppBar>
      <Trans i18nKey='preferences.title' />
    </BaseAppBar>
  )
}
