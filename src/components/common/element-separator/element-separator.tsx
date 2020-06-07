import React, { Fragment } from 'react'
import { ShowIf } from '../show-if/show-if'

export interface ElementSeparatorProps {
    separator: React.ReactElement
}

export const ElementSeparator: React.FC<ElementSeparatorProps> = ({ children, separator }) => {
  return (
    <Fragment>
      {
        React.Children
          .toArray(children)
          .filter(child => child !== null)
          .map((child, index) => {
            return (
              <Fragment>
                <ShowIf condition={index > 0}>
                  {separator}
                </ShowIf>
                {child}
              </Fragment>
            )
          })
      }
    </Fragment>
  )
}
