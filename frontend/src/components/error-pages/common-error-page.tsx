'use client'
/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LandingLayout } from '../landing-layout/landing-layout'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

export interface CommonErrorPageProps {
  titleI18nKey: string
  descriptionI18nKey?: string
}

/**
 * Renders a common customizable error page.
 *
 * @param titleI18nKey The translation key for the title of the error.
 * @param descriptionI18nKey The translation key for the description of the error. Property is optional.
 * @param children The optional child elements that will be displayed beneath the description.
 */
export const CommonErrorPage: React.FC<PropsWithChildren<CommonErrorPageProps>> = ({
  titleI18nKey,
  descriptionI18nKey,
  children
}) => {
  useTranslation()

  return (
    <LandingLayout>
      <div className='d-flex flex-column align-items-center justify-content-center my-5'>
        <h1>
          <Trans i18nKey={titleI18nKey} />
        </h1>
        {descriptionI18nKey !== undefined && (
          <h3>
            <Trans i18nKey={descriptionI18nKey} />
          </h3>
        )}
        {children}
      </div>
    </LandingLayout>
  )
}
