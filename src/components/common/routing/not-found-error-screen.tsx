import React from 'react'
import { LandingLayout } from '../../landing-layout/landing-layout'

export const NotFoundErrorScreen: React.FC = () => {
  return (
    <LandingLayout>
      <div className='text-white d-flex align-items-center justify-content-center my-5'>
        <h1>404 Not Found <small>oops.</small></h1>
      </div>
    </LandingLayout>
  )
}
