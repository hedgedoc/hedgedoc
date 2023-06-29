/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface DropdownHeaderProps {
  i18nKey: string
}

/**
 * Renders a dropdown header with a translation.
 * @param i18nKey The i18n key for the header
 */
export const DropdownHeader: React.FC<DropdownHeaderProps> = ({ i18nKey }) => {
  useTranslation()

  return (
    <Dropdown.Header>
      <Trans i18nKey={i18nKey} />
    </Dropdown.Header>
  )
}
