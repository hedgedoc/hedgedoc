/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { ShareModal } from '../../document-bar/share/share-modal'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import React, { Fragment } from 'react'
import { Share as IconShare } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders a button to open the share modal for the sidebar.
 *
 * @param className Additional classes directly given to the button
 * @param hide If the button should be hidden
 */
export const ShareSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  useTranslation()

  return (
    <Fragment>
      <SidebarButton hide={hide} className={className} icon={IconShare} onClick={showModal}>
        <Trans i18nKey={'editor.modal.shareLink.title'} />
      </SidebarButton>
      <ShareModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
