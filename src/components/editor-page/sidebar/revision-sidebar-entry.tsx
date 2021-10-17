/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useState } from 'react'
import { Trans } from 'react-i18next'
import { RevisionModal } from '../document-bar/revisions/revision-modal'
import { SidebarButton } from './sidebar-button'
import type { SpecificSidebarEntryProps } from './types'

export const RevisionSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <Fragment>
      <SidebarButton hide={hide} className={className} icon={'history'} onClick={() => setShowModal(true)}>
        <Trans i18nKey={'editor.modal.revision.title'} />
      </SidebarButton>
      <RevisionModal show={showModal} onHide={() => setShowModal(false)} />
    </Fragment>
  )
}
