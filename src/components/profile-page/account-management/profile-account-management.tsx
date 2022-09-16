/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { AccountDeletionModal } from './account-deletion-modal'
import { useBooleanState } from '../../../hooks/common/use-boolean-state'

/**
 * Profile page section that allows to export all data from the account or to delete the account.
 */
export const ProfileAccountManagement: React.FC = () => {
  useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <Card className='bg-dark mb-4'>
        <Card.Body>
          <Card.Title>
            <Trans i18nKey='profile.accountManagement' />
          </Card.Title>
          <Button variant='secondary' block href={'me/export'} className='mb-2'>
            <ForkAwesomeIcon icon='cloud-download' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='profile.exportUserData' />
          </Button>
          <Button variant='danger' block onClick={showModal}>
            <ForkAwesomeIcon icon='trash' fixedWidth={true} className='mx-2' />
            <Trans i18nKey='profile.deleteUser' />
          </Button>
        </Card.Body>
      </Card>
      <AccountDeletionModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
