import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Alert } from 'react-bootstrap'

export interface LoadingScreenProps {
  failedTitle: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ failedTitle }) => {
  return (
    <div className="loader middle">
      <div className="icon text-white">
        <FontAwesomeIcon icon="file-alt" size="6x"
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
