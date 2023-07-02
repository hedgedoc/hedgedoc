'use client'

/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HistoryContent } from '../../../components/history-page/history-content/history-content'
import { HistoryToolbar } from '../../../components/history-page/history-toolbar/history-toolbar'
import { useSafeRefreshHistoryStateCallback } from '../../../components/history-page/history-toolbar/hooks/use-safe-refresh-history-state'
import { HistoryToolbarStateContextProvider } from '../../../components/history-page/history-toolbar/toolbar-context/history-toolbar-state-context-provider'
import { LandingLayout } from '../../../components/landing-layout/landing-layout'
import type { NextPage } from 'next'
import React, { useEffect } from 'react'
import { Row } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

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
        <Row className={'justify-content-center mt-5 mb-3'}>
          <HistoryToolbar />
        </Row>
        <HistoryContent />
      </HistoryToolbarStateContextProvider>
    </LandingLayout>
  )
}

export default HistoryPage
