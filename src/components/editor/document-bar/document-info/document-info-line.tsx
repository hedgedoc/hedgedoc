import React from 'react'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { IconName } from '../../../common/fork-awesome/types'

export interface DocumentInfoLineProps {
  icon: IconName
}

export const DocumentInfoLine: React.FC<DocumentInfoLineProps> = ({ icon, children }) => {
  return (
    <span className={'d-flex align-items-center'}>
      <ForkAwesomeIcon icon={icon} size={'2x'} fixedWidth={true} className={'mx-2'}/>
      <i className={'d-flex align-items-center'}>
        {children}
      </i>
    </span>
  )
}
