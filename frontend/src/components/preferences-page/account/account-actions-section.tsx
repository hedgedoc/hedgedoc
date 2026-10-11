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
 * Preferences section for account data export and account deletion.
 */
export const AccountActionsSection: React.FC = () => {
  useTranslation()
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  return (
    <Fragment>
      <h2 className={'mb-3 h4'}>
        <Trans i18nKey='preferences.account.actions.title' />
      </h2>
      <div className={'d-flex flex-row align-items-center gap-2'}>
        {/* TODO Implement export and replace title */}
        <Button variant='secondary' disabled={true} title={'Feature not implemented yet'}>
          <UiIcon icon={IconCloudDownload} className='mx-2' />
          <Trans i18nKey='preferences.account.actions.exportUserData' />
        </Button>
        <Button variant='danger' onClick={showModal}>
          <UiIcon icon={IconTrash} className='mx-2' />
          <Trans i18nKey='preferences.account.actions.deleteUser.title' />
        </Button>
      </div>
      <AccountDeletionModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
