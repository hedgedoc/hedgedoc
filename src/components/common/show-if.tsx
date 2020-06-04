import React, { Fragment } from 'react'

export interface ShowIfProps {
  condition: boolean
}

export const ShowIf: React.FC<ShowIfProps> = ({ children, condition }) => {
  return condition ? <Fragment>{children}</Fragment> : null
}
