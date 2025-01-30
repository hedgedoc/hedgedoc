/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { NoteType } from '@hedgedoc/commons'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import { NoteTypeIcon } from '../../../common/note-type-icon/note-type-icon'
import { Trans, useTranslation } from 'react-i18next'
import { useTranslatedText } from '../../../../hooks/common/use-translated-text'
import { UiIcon } from '../../../common/icons/ui-icon'
import { Funnel as IconFunnel } from 'react-bootstrap-icons'

export interface FilterByNoteTypeProps {
  value: NoteType | null
  onChange: (value: NoteType | null) => void
}

export const FilterByNoteType: React.FC<FilterByNoteTypeProps> = ({ value, onChange }) => {
  useTranslation()

  const labelInitial = useTranslatedText('explore.filters.byType.title')
  const labels = useMemo(
    () => ({
      [NoteType.DOCUMENT]: (
        <>
          <NoteTypeIcon noteType={NoteType.DOCUMENT} className={'me-2'} />
          <Trans i18nKey={'explore.filters.byType.documents'} />
        </>
      ),
      [NoteType.SLIDE]: (
        <>
          <NoteTypeIcon noteType={NoteType.SLIDE} className={'me-2'} />
          <Trans i18nKey={'explore.filters.byType.slides'} />
        </>
      )
    }),
    []
  )

  const onClickDropdownItem = useCallback(
    (eventKey: string | null) => {
      if (eventKey === '' || eventKey === null) {
        onChange(null)
      } else {
        onChange(eventKey as NoteType)
      }
    },
    [onChange]
  )

  return (
    <DropdownButton
      as={ButtonGroup}
      variant={'secondary'}
      title={
        value === null ? (
          <>
            <UiIcon icon={IconFunnel} />
            <span className={'ms-1'}>{labelInitial}</span>
          </>
        ) : (
          labels[value]
        )
      }
      id={'filter-by-type'}
      onSelect={onClickDropdownItem}>
      <Dropdown.Item eventKey={''}>
        <Trans i18nKey={'explore.filters.byType.all'} />
      </Dropdown.Item>
      <Dropdown.Item eventKey={NoteType.DOCUMENT}>{labels[NoteType.DOCUMENT]}</Dropdown.Item>
      <Dropdown.Item eventKey={NoteType.SLIDE}>{labels[NoteType.SLIDE]}</Dropdown.Item>
    </DropdownButton>
  )
}
