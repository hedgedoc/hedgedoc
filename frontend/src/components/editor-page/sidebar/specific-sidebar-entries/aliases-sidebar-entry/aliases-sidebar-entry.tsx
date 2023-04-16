/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../../hooks/common/use-boolean-state'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../../types'
import { AliasesModal } from './aliases-modal/aliases-modal'
import React, { Fragment } from 'react'
import { Tags as IconTags } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

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
      <SidebarButton hide={hide} className={className} icon={IconTags} onClick={setShowModal}>
        <Trans i18nKey={'editor.modal.aliases.title'} />
      </SidebarButton>
      <AliasesModal show={showModal} onHide={setHideModal} />
    </Fragment>
  )
}
