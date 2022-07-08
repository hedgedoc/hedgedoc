/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Trans } from 'react-i18next'
import { VersionInfoModal } from './version-info-modal'
import { cypressId } from '../../../../utils/cypress-attribute'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'

export const VersionInfoLink: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <a {...cypressId('show-version-modal')} href={'#'} className={'text-light'} onClick={showModal}>
        <Trans i18nKey={'landing.versionInfo.versionInfo'} />
      </a>
      <VersionInfoModal onHide={closeModal} show={modalVisibility} />
    </Fragment>
  )
}
