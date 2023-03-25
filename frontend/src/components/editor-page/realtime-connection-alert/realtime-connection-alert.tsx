/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { UiIcon } from '../../common/icons/ui-icon'
import React, { Fragment } from 'react'
import { Alert } from 'react-bootstrap'
import { ArrowRepeat as IconArrowRepeat } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Modal with a spinner that is only shown while reconnecting to the realtime backend
 */
export const RealtimeConnectionAlert: React.FC = () => {
  const isSynced = useApplicationState((state) => state.realtimeStatus.isSynced)
  useTranslation()

  if (isSynced) {
    return <Fragment />
  }

  return (
    <Alert variant={'warning'} className={'m-0 rounded-0'}>
      <Trans i18nKey={'realtime.connecting'}></Trans>
      <UiIcon icon={IconArrowRepeat} spin={true} className={'ms-2 mb-1'} />
    </Alert>
  )
}
