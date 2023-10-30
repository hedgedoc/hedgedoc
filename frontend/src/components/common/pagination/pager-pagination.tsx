/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PagerItem } from './pager-item'
import React, { useEffect, useMemo, useState } from 'react'
import { Pagination } from 'react-bootstrap'

export interface PaginationProps {
  numberOfPageButtonsToShowAfterAndBeforeCurrent: number
  onPageChange: (pageIndex: number) => void
  lastPageIndex: number
}

/**
 * Renders a pagination menu to move back and forth between pages.
 *
 * @param numberOfPageButtonsToShowAfterAndBeforeCurrent The number of buttons that should be shown before and after the current button.
 * @param onPageChange The callback when one of the buttons is clicked
 * @param lastPageIndex The index of the last page
 */
export const PagerPagination: React.FC<PaginationProps> = ({
  numberOfPageButtonsToShowAfterAndBeforeCurrent,
  onPageChange,
  lastPageIndex
}) => {
  if (numberOfPageButtonsToShowAfterAndBeforeCurrent % 2 !== 0) {
    throw new Error('number of pages to show must be even!')
  }

  const [pageIndex, setPageIndex] = useState(0)
  const correctedPageIndex = Math.min(pageIndex, lastPageIndex)
  const wantedUpperPageIndex = correctedPageIndex + numberOfPageButtonsToShowAfterAndBeforeCurrent
  const wantedLowerPageIndex = correctedPageIndex - numberOfPageButtonsToShowAfterAndBeforeCurrent

  useEffect(() => {
    onPageChange(pageIndex)
  }, [onPageChange, pageIndex])

  const correctedLowerPageIndex = useMemo(
    () =>
      Math.min(
        Math.max(Math.min(wantedLowerPageIndex, wantedLowerPageIndex + lastPageIndex - wantedUpperPageIndex), 0),
        lastPageIndex
      ),
    [wantedLowerPageIndex, lastPageIndex, wantedUpperPageIndex]
  )

  const correctedUpperPageIndex = useMemo(
    () =>
      Math.max(Math.min(Math.max(wantedUpperPageIndex, wantedUpperPageIndex - wantedLowerPageIndex), lastPageIndex), 0),
    [wantedUpperPageIndex, lastPageIndex, wantedLowerPageIndex]
  )

  const paginationItemsBefore = useMemo(() => {
    return new Array(correctedPageIndex - correctedLowerPageIndex).map((k, index) => {
      const itemIndex = correctedLowerPageIndex + index
      return <PagerItem key={itemIndex} index={itemIndex} onClick={setPageIndex} />
    })
  }, [correctedPageIndex, correctedLowerPageIndex, setPageIndex])

  const paginationItemsAfter = useMemo(() => {
    return new Array(correctedUpperPageIndex - correctedPageIndex).map((k, index) => {
      const itemIndex = correctedPageIndex + index + 1
      return <PagerItem key={itemIndex} index={itemIndex} onClick={setPageIndex} />
    })
  }, [correctedUpperPageIndex, correctedPageIndex, setPageIndex])

  return (
    <Pagination dir='ltr'>
      {correctedLowerPageIndex > 0 && (
        <>
          <PagerItem key={0} index={0} onClick={setPageIndex} />
          <Pagination.Ellipsis disabled />
        </>
      )}
      {paginationItemsBefore}
      <Pagination.Item active>{correctedPageIndex + 1}</Pagination.Item>
      {paginationItemsAfter}
      {correctedUpperPageIndex < lastPageIndex && (
        <>
          <Pagination.Ellipsis disabled />
          <PagerItem key={lastPageIndex} index={lastPageIndex} onClick={setPageIndex} />
        </>
      )}
    </Pagination>
  )
}
