/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import { UiIcon } from '../../../common/icons/ui-icon'
import {
  SortAlphaUp as IconSortAlphaUp,
  SortAlphaDown as IconSortAlphaDown,
  SortUp as IconSortUp,
  SortDown as IconSortDown
} from 'react-bootstrap-icons'
import { SortMode } from '@hedgedoc/commons'

export interface SortButtonProps {
  selected: SortMode
  onChange: (mode: SortMode) => void
}

export const SortButton: React.FC<SortButtonProps> = ({ selected, onChange }) => {
  useTranslation()

  const labelAscending = useTranslatedText('explore.sort.asc')
  const labelDescending = useTranslatedText('explore.sort.desc')
  const labels = useMemo(
    () => ({
      [SortMode.TITLE_ASC]: (
        <>
          <UiIcon icon={IconSortAlphaDown} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byTitle'} values={{ direction: labelAscending }} />
        </>
      ),
      [SortMode.TITLE_DESC]: (
        <>
          <UiIcon icon={IconSortAlphaUp} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byTitle'} values={{ direction: labelDescending }} />
        </>
      ),
      [SortMode.UPDATED_AT_ASC]: (
        <>
          <UiIcon icon={IconSortUp} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byUpdatedDate'} values={{ direction: labelAscending }} />
        </>
      ),
      [SortMode.UPDATED_AT_DESC]: (
        <>
          <UiIcon icon={IconSortDown} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byUpdatedDate'} values={{ direction: labelDescending }} />
        </>
      )
    }),
    [labelAscending, labelDescending]
  )

  const onClickDropdownItem = useCallback(
    (eventKey: string | null) => {
      onChange(eventKey as SortMode)
    },
    [onChange]
  )

  return (
    <DropdownButton
      as={ButtonGroup}
      variant={'secondary'}
      title={labels[selected]}
      id={'filter-by-type'}
      onSelect={onClickDropdownItem}>
      <Dropdown.Item eventKey={SortMode.UPDATED_AT_DESC}>{labels[SortMode.UPDATED_AT_DESC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.UPDATED_AT_ASC}>{labels[SortMode.UPDATED_AT_ASC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.TITLE_ASC}>{labels[SortMode.TITLE_ASC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.TITLE_DESC}>{labels[SortMode.TITLE_DESC]}</Dropdown.Item>
    </DropdownButton>
  )
}
