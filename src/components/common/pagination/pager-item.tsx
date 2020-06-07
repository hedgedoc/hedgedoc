import React from 'react'

export interface PageItemProps {
    onClick: (index: number) => void
    index: number
}

export const PagerItem: React.FC<PageItemProps> = ({ index, onClick }) => {
  return (
    <li className="page-item">
      <span className="page-link" role="button" onClick={() => onClick(index)}>
        {index + 1}
      </span>
    </li>
  )
}
