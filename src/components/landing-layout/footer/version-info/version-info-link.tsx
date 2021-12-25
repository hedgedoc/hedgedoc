/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useState } from 'react'
import { Trans } from 'react-i18next'
import { VersionInfoModal } from './version-info-modal'
import { cypressId } from '../../../../utils/cypress-attribute'

export const VersionInfoLink: React.FC = () => {
  const [show, setShow] = useState(false)
  const closeModal = useCallback(() => setShow(false), [])
  const showModal = useCallback(() => setShow(true), [])

  return (
    <Fragment>
      <a {...cypressId('show-version-modal')} href={'#'} className={'text-light'} onClick={showModal}>
        <Trans i18nKey={'landing.versionInfo.versionInfo'} />
      </a>
      <VersionInfoModal onHide={closeModal} show={show} />
    </Fragment>
  )
}
