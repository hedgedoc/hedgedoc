/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { PermissionModal } from '../../document-bar/permissions/permission-modal'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'

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
      <SidebarButton hide={hide} className={className} icon={'lock'} onClick={showModal}>
        <Trans i18nKey={'editor.modal.permissions.title'} />
      </SidebarButton>
      <PermissionModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
