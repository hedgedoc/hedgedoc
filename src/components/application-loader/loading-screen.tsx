import React from 'react'
import { Alert } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'

export interface LoadingScreenProps {
  failedTitle: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ failedTitle }) => {
  return (
    <div className="loader middle">
      <div className="icon text-white">
        <ForkAwesomeIcon icon="file-text" size="5x"
          className={failedTitle ? 'animation-shake' : 'animation-pulse'}/>
      </div>
      {
        failedTitle !== ''
          ? (
            <Alert variant={'danger'}>
              The task '{failedTitle}' failed.<br/>
              For further information look into the browser console.
            </Alert>
          )
          : null
      }
    </div>
  )
}
