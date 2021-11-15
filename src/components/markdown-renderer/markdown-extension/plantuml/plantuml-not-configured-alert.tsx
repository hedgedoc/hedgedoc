/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

export const PlantumlNotConfiguredAlert: React.FC = () => {
  useTranslation()

  return (
    <p className='alert alert-danger'>
      <Trans i18nKey={'renderer.plantuml.notConfigured'} />
    </p>
  )
}
