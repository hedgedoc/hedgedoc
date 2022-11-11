/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect } from 'react'
import type { NextPage } from 'next'
import { Trans, useTranslation } from 'react-i18next'
import { HistoryToolbar } from '../components/history-page/history-toolbar/history-toolbar'
import { Row } from 'react-bootstrap'
import { HistoryContent } from '../components/history-page/history-content/history-content'
import { LandingLayout } from '../components/landing-layout/landing-layout'
import { HistoryToolbarStateContextProvider } from '../components/history-page/history-toolbar/toolbar-context/history-toolbar-state-context-provider'
import { useSafeRefreshHistoryStateCallback } from '../components/history-page/history-toolbar/hooks/use-safe-refresh-history-state'

/**
 * The page that shows the local and remote note history.
 */
const HistoryPage: NextPage = () => {
  useTranslation()

  const safeRefreshHistoryStateCallback = useSafeRefreshHistoryStateCallback()
  useEffect(() => {
    safeRefreshHistoryStateCallback()
  }, [safeRefreshHistoryStateCallback])

  return (
    <LandingLayout>
      <HistoryToolbarStateContextProvider>
        <h1 className='mb-4'>
          <Trans i18nKey={'landing.navigation.history'} />
        </h1>
        <Row className={'justify-content-center mt-5 mb-3'}>
          <HistoryToolbar />
        </Row>
        <HistoryContent />
      </HistoryToolbarStateContextProvider>
    </LandingLayout>
  )
}

export default HistoryPage
