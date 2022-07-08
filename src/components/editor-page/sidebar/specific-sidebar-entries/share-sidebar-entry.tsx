/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ShareModal } from '../../document-bar/share/share-modal'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'

export const ShareSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  useTranslation()

  return (
    <Fragment>
      <SidebarButton hide={hide} className={className} icon={'share'} onClick={showModal}>
        <Trans i18nKey={'editor.modal.shareLink.title'} />
      </SidebarButton>
      <ShareModal show={modalVisibility} onHide={closeModal} />
    </Fragment>
  )
}
