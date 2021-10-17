/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ShareModal } from '../document-bar/share/share-modal'
import { SidebarButton } from './sidebar-button'
import type { SpecificSidebarEntryProps } from './types'

export const ShareSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [showModal, setShowModal] = useState(false)
  useTranslation()

  return (
    <Fragment>
      <SidebarButton hide={hide} className={className} icon={'share'} onClick={() => setShowModal(true)}>
        <Trans i18nKey={'editor.modal.shareLink.title'} />
      </SidebarButton>
      <ShareModal show={showModal} onHide={() => setShowModal(false)} />
    </Fragment>
  )
}
