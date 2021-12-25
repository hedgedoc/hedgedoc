/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useState } from 'react'
import { Trans } from 'react-i18next'
import { RevisionModal } from '../../document-bar/revisions/revision-modal'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'

export const RevisionSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  const [showModal, setShowModal] = useState(false)
  const onHide = useCallback(() => {
    setShowModal(false)
  }, [])
  const onShow = useCallback(() => {
    setShowModal(true)
  }, [])

  return (
    <Fragment>
      <SidebarButton hide={hide} className={className} icon={'history'} onClick={onShow}>
        <Trans i18nKey={'editor.modal.revision.title'} />
      </SidebarButton>
      <RevisionModal show={showModal} onHide={onHide} />
    </Fragment>
  )
}
