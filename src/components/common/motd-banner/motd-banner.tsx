import equal from 'fast-deep-equal'
import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ApplicationState } from '../../../redux'
import { Alert, Button } from 'react-bootstrap'
import { setBanner } from '../../../redux/banner/methods'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import { ShowIf } from '../show-if/show-if'

export const MotdBanner: React.FC = () => {
  const bannerState = useSelector((state: ApplicationState) => state.banner, equal)

  const dismissBanner = () => {
    setBanner({ ...bannerState, show: false })
    window.localStorage.setItem('bannerTimeStamp', bannerState.timestamp)
  }

  return (
    <ShowIf condition={bannerState.show}>
      <Alert variant='primary' dir='auto' className='mb-0 text-center d-flex flex-row justify-content-center'>
        <Link to='/s/banner' className='flex-grow-1 align-self-center text-black'>
          {bannerState.text}
        </Link>
        <Button
          variant='outline-primary'
          size='sm'
          className='mx-2'
          onClick={dismissBanner}>
          <ForkAwesomeIcon icon='times'/>
        </Button>
      </Alert>
    </ShowIf>
  )
}
