/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { createNumberRangeArray } from '../../../../common/number-range/number-range'
import { Button, Popover } from 'react-bootstrap'
import { TableSizeText } from './table-size-text'
import { Trans, useTranslation } from 'react-i18next'
import { cypressAttribute, cypressId } from '../../../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import type { PopoverProps } from 'react-bootstrap/Popover'
import { useOnRefChange } from '../../../../markdown-renderer/hooks/use-on-ref-change'
import styles from './table-picker.module.scss'

export interface TableSizePickerPopoverProps extends Omit<PopoverProps, 'id'> {
  onShowCustomSizeModal: () => void
  onTableSizeSelected: (rows: number, cols: number) => void
  onRefUpdate: (newRef: HTMLDivElement | null) => void
}

export interface TableSize {
  rows: number
  columns: number
}

export const TableSizePickerPopover: React.FC<TableSizePickerPopoverProps> = ({
  onShowCustomSizeModal,
  onTableSizeSelected,
  onRefUpdate,
  ...props
}) => {
  const { t } = useTranslation()
  const [tableSize, setTableSize] = useState<TableSize>()

  const onSizeHover = useCallback(
    (selectedRows: number, selectedCols: number) => () => {
      setTableSize({
        rows: selectedRows,
        columns: selectedCols
      })
    },
    []
  )

  const tableContainer = useMemo(
    () =>
      createNumberRangeArray(8).map((row: number) =>
        createNumberRangeArray(10).map((col: number) => {
          const selected = tableSize && row < tableSize.rows && col < tableSize.columns
          return (
            <div
              key={`${row}_${col}`}
              className={`${styles['table-cell']} ${selected ? 'bg-primary border-primary' : ''}`}
              {...cypressAttribute('selected', selected ? 'true' : 'false')}
              {...cypressAttribute('col', `${col + 1}`)}
              {...cypressAttribute('row', `${row + 1}`)}
              onMouseEnter={onSizeHover(row + 1, col + 1)}
              title={t('editor.editorToolbar.table.size', { cols: col + 1, rows: row + 1 })}
              onClick={() => onTableSizeSelected(row + 1, col + 1)}
            />
          )
        })
      ),
    [onTableSizeSelected, onSizeHover, t, tableSize]
  )

  const popoverRef = useRef<HTMLDivElement | null>(null)
  useOnRefChange(popoverRef, (newRef) => onRefUpdate(newRef))

  return (
    <Popover
      {...props}
      ref={popoverRef}
      id={'table-picker'}
      {...cypressId('table-size-picker-popover')}
      className={`${styles['table-picker-container']} bg-light`}>
      <Popover.Title>
        <TableSizeText tableSize={tableSize} />
      </Popover.Title>
      <Popover.Content>
        <div className={styles['table-container']} role='grid'>
          {tableContainer}
        </div>
        <div className='d-flex justify-content-center mt-2'>
          <Button {...cypressId('show-custom-table-modal')} className={'text-center'} onClick={onShowCustomSizeModal}>
            <ForkAwesomeIcon icon='table' />
            &nbsp;
            <Trans i18nKey={'editor.editorToolbar.table.customSize'} />
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  )
}
