'use client'

/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Nav } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useTranslatedText } from '../../hooks/common/use-translated-text'
import { LandingLayout } from '../landing-layout/landing-layout'
import type { TabParam } from '../../app/(editor)/preferences/[tab]/page'
import { Logger } from '../../utils/logger'

const preferencesTabs = ['appearance', 'editor', 'profile', 'account', 'api'] as const

const logger = new Logger('PreferencesPage')

/**
 * Common layout for the preferences page with its tabs.
 */
export const PreferencesLayout: React.FC<PropsWithChildren> = ({ children }) => {
  useTranslation()
  const pageParams = useParams<Partial<TabParam>>()
  const navigationLabel = useTranslatedText('preferences.title')

  if (!pageParams?.tab) {
    logger.error('No tab parameter received from Next.js. This should not happen.')
    return null
  }

  return (
    <LandingLayout>
      <div className='my-4 text-start'>
        <h1 className='h3 mb-3'>
          <Trans i18nKey='preferences.title' />
        </h1>
        <Nav
          as='nav'
          role='navigation'
          variant='tabs'
          activeKey={pageParams.tab}
          aria-label={navigationLabel}
          className='mb-4'>
          {preferencesTabs.map((slug) => (
            <Nav.Item key={slug}>
              <Link href={`/preferences/${slug}`} passHref={true} legacyBehavior={true}>
                <Nav.Link eventKey={slug} aria-current={pageParams.tab === slug ? 'true' : 'false'}>
                  <Trans i18nKey={`preferences.tabs.${slug}`} />
                </Nav.Link>
              </Link>
            </Nav.Item>
          ))}
        </Nav>
        {children}
      </div>
    </LandingLayout>
  )
}
