import React, { Fragment, useEffect } from 'react'

export interface PagerPageProps {
    pageIndex: number
    numberOfElementsPerPage: number
    onLastPageIndexChange: (lastPageIndex: number) => void
}

export const Pager: React.FC<PagerPageProps> = ({ children, numberOfElementsPerPage, pageIndex, onLastPageIndexChange }) => {
  useEffect(() => {
    const lastPageIndex = Math.ceil(React.Children.count(children) / numberOfElementsPerPage) - 1
    onLastPageIndexChange(lastPageIndex)
  }, [children, numberOfElementsPerPage, onLastPageIndexChange])

  return <Fragment>
    {
      React.Children.toArray(children).filter((value, index) => {
        const pageOfElement = Math.floor((index) / numberOfElementsPerPage)
        return (pageOfElement === pageIndex)
      })
    }
  </Fragment>
}
