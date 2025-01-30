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

export enum SortMode {
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  CREATED_AT_ASC = 'created_at_asc',
  CREATED_AT_DESC = 'created_at_desc',
  LAST_VISITED_ASC = 'last_visited_asc',
  LAST_VISITED_DESC = 'last_visited_desc'
}

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
      [SortMode.CREATED_AT_ASC]: (
        <>
          <UiIcon icon={IconSortUp} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byCreationDate'} values={{ direction: labelAscending }} />
        </>
      ),
      [SortMode.CREATED_AT_DESC]: (
        <>
          <UiIcon icon={IconSortDown} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byCreationDate'} values={{ direction: labelDescending }} />
        </>
      ),
      [SortMode.LAST_VISITED_ASC]: (
        <>
          <UiIcon icon={IconSortUp} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byLastVisited'} values={{ direction: labelAscending }} />
        </>
      ),
      [SortMode.LAST_VISITED_DESC]: (
        <>
          <UiIcon icon={IconSortDown} className={'me-1'} />
          <Trans i18nKey={'explore.sort.byLastVisited'} values={{ direction: labelDescending }} />
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
      <Dropdown.Item eventKey={SortMode.LAST_VISITED_DESC}>{labels[SortMode.LAST_VISITED_DESC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.LAST_VISITED_ASC}>{labels[SortMode.LAST_VISITED_ASC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.CREATED_AT_DESC}>{labels[SortMode.CREATED_AT_DESC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.CREATED_AT_ASC}>{labels[SortMode.CREATED_AT_ASC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.TITLE_ASC}>{labels[SortMode.TITLE_ASC]}</Dropdown.Item>
      <Dropdown.Item eventKey={SortMode.TITLE_DESC}>{labels[SortMode.TITLE_DESC]}</Dropdown.Item>
    </DropdownButton>
  )
}
