/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../common/icons/ui-icon'
import React from 'react'
import { Alert } from 'react-bootstrap'
import { ArrowRepeat as IconArrowRepeat } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Modal with a spinner that is only shown while reconnecting to the realtime backend
 */
export const RealtimeConnectionAlert: React.FC = () => {
  useTranslation()

  return (
    <Alert variant={'warning'} className={'w-100 m-0 px-2 py-1 border-top-0 border-bottom-0 d-flex align-items-center'}>
      <Trans i18nKey={'realtime.connecting'}></Trans>
      <UiIcon icon={IconArrowRepeat} spin={true} className={'ms-2 mb-1'} />
    </Alert>
  )
}
