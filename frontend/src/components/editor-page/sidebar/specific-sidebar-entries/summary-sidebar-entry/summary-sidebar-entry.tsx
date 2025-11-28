/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useState } from 'react'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { useBooleanState } from '../../../../../hooks/common/use-boolean-state'
import { Trans, useTranslation } from 'react-i18next'
import { Lightbulb as IconLightbulb } from 'react-bootstrap-icons'
import { SummaryModal } from './summary-modal'
import type { SpecificSidebarEntryProps } from '../../types'

/**
 * Renders the sidebar entry for AI summary generation.
 */
export const SummarySidebarEntry: React.FC<SpecificSidebarEntryProps> = ({ hide }) => {
  useTranslation()
  const [showModal, setShowModal, setHideModal] = useBooleanState(false)

  return (
    <Fragment>
      <SidebarButton icon={IconLightbulb} onClick={setShowModal} hide={hide}>
        <Trans i18nKey={'editor.modal.summary.button'} />
      </SidebarButton>
      <SummaryModal show={showModal} onHide={setHideModal} />
    </Fragment>
  )
}
