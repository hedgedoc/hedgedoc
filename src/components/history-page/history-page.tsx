/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { HistoryContent } from './history-content/history-content'
import { HistoryToolbar, HistoryToolbarState, initToolbarState } from './history-toolbar/history-toolbar'
import { sortAndFilterEntries } from './utils'
import { refreshHistoryState } from '../../redux/history/methods'
import { HistoryEntry } from '../../redux/history/types'
import { showErrorNotification } from '../../redux/ui-notifications/methods'
import { useApplicationState } from '../../hooks/common/use-application-state'

export const HistoryPage: React.FC = () => {
  useTranslation()

  const allEntries = useApplicationState((state) => state.history)
  const [toolbarState, setToolbarState] = useState<HistoryToolbarState>(initToolbarState)

  const entriesToShow = useMemo<HistoryEntry[]>(
    () => sortAndFilterEntries(allEntries, toolbarState),
    [allEntries, toolbarState]
  )

  useEffect(() => {
    refreshHistoryState().catch(showErrorNotification('landing.history.error.getHistory.text'))
  }, [])

  return (
    <Fragment>
      <h1 className='mb-4'>
        <Trans i18nKey='landing.navigation.history' />
      </h1>
      <Row className={'justify-content-center mt-5 mb-3'}>
        <HistoryToolbar onSettingsChange={setToolbarState} />
      </Row>
      <HistoryContent viewState={toolbarState.viewState} entries={entriesToShow} />
    </Fragment>
  )
}
