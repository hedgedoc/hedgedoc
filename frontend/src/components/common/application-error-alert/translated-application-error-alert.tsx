/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ApplicationErrorAlert } from './application-error-alert'

export interface ErrorBoxProps {
  errorI18nKey: string
  className?: string
}

/**
 * Renders an alert box that indicates an error in the application.
 *
 * @param error The error message to display.
 */
export const TranslatedApplicationErrorAlert: React.FC<ErrorBoxProps> = ({ errorI18nKey, className }) => {
  useTranslation()

  return (
    <ApplicationErrorAlert className={className}>
      <Trans i18nKey={errorI18nKey} />
    </ApplicationErrorAlert>
  )
}
