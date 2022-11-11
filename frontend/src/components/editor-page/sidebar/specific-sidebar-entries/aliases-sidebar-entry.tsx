/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { SpecificSidebarEntryProps } from '../types'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import { AliasesModal } from '../../document-bar/aliases/aliases-modal'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'

/**
 * Component that shows a button in the editor sidebar for opening the aliases modal.
 *
 * @param className Additional CSS classes that should be added to the sidebar button.
 * @param hide True when the sidebar button should be hidden, False otherwise.
 */
export const AliasesSidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ className, hide }) => {
  useTranslation()
  const [showModal, setShowModal, setHideModal] = useBooleanState(false)

  return (
    <Fragment>
      <SidebarButton hide={hide} className={className} icon={'tags'} onClick={setShowModal}>
        <Trans i18nKey={'editor.modal.aliases.title'} />
      </SidebarButton>
      <AliasesModal show={showModal} onHide={setHideModal} />
    </Fragment>
  )
}
