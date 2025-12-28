'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BaseAppBar } from '../../../../../components/layout/app-bar/base-app-bar'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

export default function AppBar() {
  useTranslation()
  return (
    <BaseAppBar>
      <Trans i18nKey={'explore.modes.public'} />
    </BaseAppBar>
  )
}
