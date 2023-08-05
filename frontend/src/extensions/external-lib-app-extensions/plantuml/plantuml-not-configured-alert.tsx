/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { TranslatedApplicationErrorAlert } from '../../../components/common/application-error-alert/translated-application-error-alert'

/**
 * Renders an alert if plantuml is not configured.
 */
export const PlantumlNotConfiguredAlert: React.FC = () => {
  return <TranslatedApplicationErrorAlert errorI18nKey={'renderer.plantuml.notConfigured'} />
}
