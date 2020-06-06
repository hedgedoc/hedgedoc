import React, { useEffect, useState } from 'react'
import { Pagination } from 'react-bootstrap'
import { ShowIf } from '../common/show-if'
import { PagerItem } from './pager-item'

export interface PaginationProps {
  numberOfPageButtonsToShowAfterAndBeforeCurrent: number
  onPageChange: (pageIndex: number) => void
  lastPageIndex: number
}

export const PagerPagination: React.FC<PaginationProps> = ({ numberOfPageButtonsToShowAfterAndBeforeCurrent, onPageChange, lastPageIndex }) => {
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

  const correctedLowerPageIndex =
    Math.min(
      Math.max(
        Math.min(
          wantedLowerPageIndex,
          wantedLowerPageIndex + lastPageIndex - wantedUpperPageIndex
        ),
        0
      ),
      lastPageIndex
    )

  const correctedUpperPageIndex =
    Math.max(
      Math.min(
        Math.max(
          wantedUpperPageIndex,
          wantedUpperPageIndex - wantedLowerPageIndex
        ),
        lastPageIndex
      ),
      0
    )

  const paginationItemsBefore = Array.from(new Array(correctedPageIndex - correctedLowerPageIndex)).map((k, index) => {
    const itemIndex = correctedLowerPageIndex + index
    return <PagerItem key={itemIndex} index={itemIndex} onClick={setPageIndex}/>
  })

  const paginationItemsAfter = Array.from(new Array(correctedUpperPageIndex - correctedPageIndex)).map((k, index) => {
    const itemIndex = correctedPageIndex + index + 1
    return <PagerItem key={itemIndex} index={itemIndex} onClick={setPageIndex}/>
  })

  return (
    <Pagination>
      <ShowIf condition={correctedLowerPageIndex > 0}>
        <PagerItem key={0} index={0} onClick={setPageIndex}/>
        <Pagination.Ellipsis disabled/>
      </ShowIf>
      {paginationItemsBefore}
      <Pagination.Item active>{correctedPageIndex + 1}</Pagination.Item>
      {paginationItemsAfter}
      <ShowIf condition={correctedUpperPageIndex < lastPageIndex}>
        <Pagination.Ellipsis disabled/>
        <PagerItem key={lastPageIndex} index={lastPageIndex} onClick={setPageIndex}/>
      </ShowIf>
    </Pagination>
  )
}
