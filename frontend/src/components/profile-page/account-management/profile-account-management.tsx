/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../hooks/common/use-boolean-state'
import { UiIcon } from '../../common/icons/ui-icon'
import { AccountDeletionModal } from './account-deletion-modal'
import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { CloudDownload as IconCloudDownload, Trash as IconTrash } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Account actions for exporting data or deleting the account.
 */
export const ProfileAccountManagement: React.FC = () => {
  useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <div className='d-grid gap-2 mt-4'>
        <Button variant='secondary' href={'me/export'}>
          <UiIcon icon={IconCloudDownload} className='mx-2' />
          <Trans i18nKey='profile.exportUserData' />
        </Button>
        <Button variant='danger' onClick={showModal}>
          <UiIcon icon={IconTrash} className='mx-2' />
          <Trans i18nKey='profile.deleteUser' />
        </Button>
      </div>
      <AccountDeletionModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
