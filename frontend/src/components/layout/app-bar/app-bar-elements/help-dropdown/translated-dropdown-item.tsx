/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'
import { UiIcon } from '../../../../common/icons/ui-icon'
import type { TOptions } from 'i18next'
import React from 'react'
import { Dropdown } from 'react-bootstrap'
import type { Icon } from 'react-bootstrap-icons'
import type { DropdownItemProps } from 'react-bootstrap/DropdownItem'

interface TranslatedDropdownItemProps extends DropdownItemProps {
  i18nKey: string
  i18nKeyOptions?: TOptions
  icon?: Icon
  target?: string
}

/**
 * Renders a dropdown item with translated title.
 * @param i18nKey The i18n key for the title
 * @param i18nKeyOptions The options for the i18n key
 * @param icon The icon that should be rendered before the title
 * @param props Other props for the dropdown item
 */
export const TranslatedDropdownItem: React.FC<TranslatedDropdownItemProps> = ({
  i18nKey,
  i18nKeyOptions,
  icon,
  ...props
}) => {
  const title = useTranslatedText(i18nKey, i18nKeyOptions)

  return (
    <Dropdown.Item {...props} title={title} className={'d-flex align-items-center'}>
      {icon !== undefined && <UiIcon icon={icon} className={'me-2'} />}
      <span>{title}</span>
    </Dropdown.Item>
  )
}
