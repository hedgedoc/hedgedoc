/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../../hooks/common/use-boolean-state'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../../types'
import { PermissionModal } from './permissions-modal/permission-modal'
import React, { Fragment } from 'react'
import { Lock as IconLock } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { cypressId } from '../../../../../utils/cypress-attribute'

/**
 * Renders a button to open the permission modal for the sidebar.
 *
 * @param className Additional classes directly given to the button
 * @param hide If the button should be hidden
 */
export const PermissionsSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  useTranslation()

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        className={className}
        icon={IconLock}
        onClick={showModal}
        {...cypressId('sidebar-permission-btn')}>
        <Trans i18nKey={'editor.modal.permissions.title'} />
      </SidebarButton>
      <PermissionModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
