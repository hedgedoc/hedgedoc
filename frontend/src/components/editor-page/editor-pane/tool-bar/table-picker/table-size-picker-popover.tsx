/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressAttribute, cypressId } from '../../../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { createNumberRangeArray } from '../../../../common/number-range/number-range'
import styles from './table-picker.module.scss'
import { TableSizeText } from './table-size-text'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Popover } from 'react-bootstrap'
import type { PopoverProps } from 'react-bootstrap/Popover'
import { Trans, useTranslation } from 'react-i18next'

export interface TableSizePickerPopoverProps extends PopoverProps {
  onShowCustomSizeModal: () => void
  onTableSizeSelected: (rows: number, cols: number) => void
}

export interface TableSize {
  rows: number
  columns: number
}

/**
 * Renders a popover to select the size of a new table to be inserted.
 *
 * @param onShowCustomSizeModal The callback, that will be called if the {@link CustomTableSizeModal} should be shown.
 * @param onTableSizeSelected The callback, that will be called if a table size was selected.
 * @param onRefUpdate The callback, that will be called if ref was updated.
 * @param props Additional props given directly to the modal
 */
export const TableSizePickerPopover = React.forwardRef<HTMLDivElement, TableSizePickerPopoverProps>(
  ({ onShowCustomSizeModal, onTableSizeSelected, ...props }, ref) => {
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
                title={t('editor.editorToolbar.table.titleWithSize', { cols: col + 1, rows: row + 1 }) ?? undefined}
                onClick={() => onTableSizeSelected(row + 1, col + 1)}
              />
            )
          })
        ),
      [onTableSizeSelected, onSizeHover, t, tableSize]
    )

    return (
      <Popover ref={ref} {...cypressId('table-size-picker-popover')} className={`bg-light`} {...props}>
        <Popover.Header>
          <TableSizeText tableSize={tableSize} />
        </Popover.Header>
        <Popover.Body>
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
        </Popover.Body>
      </Popover>
    )
  }
)

TableSizePickerPopover.displayName = 'TableSizePickerPopover'
