import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Alert } from 'react-bootstrap'

export interface LoadingScreenProps {
  failed: boolean
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ failed }) => {
  return (
    <div className="loader middle">
      <div className="icon">
        <FontAwesomeIcon icon="file-alt" size="6x"
          className={failed ? 'animation-shake' : 'animation-pulse'}/>
      </div>
      {
        failed ? <Alert variant={'danger'}>An error occurred while loading the application!</Alert> : null
      }
    </div>
  )
}
