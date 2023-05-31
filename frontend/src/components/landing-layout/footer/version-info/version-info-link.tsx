/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../../utils/cypress-attribute'
import { VersionInfoModal } from './version-info-modal'
import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { Trans } from 'react-i18next'

/**
 * Renders a link for the version info and the {@link VersionInfoModal}.
 */
export const VersionInfoLink: React.FC = () => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <Button size={'sm'} variant={'link'} {...cypressId('show-version-modal')} className={'p-0'} onClick={showModal}>
        <Trans i18nKey={'landing.versionInfo.versionInfo'} />
      </Button>
      <VersionInfoModal onHide={closeModal} show={modalVisibility} />
    </Fragment>
  )
}
