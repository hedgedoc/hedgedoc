/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { LandingLayout } from '../../landing-layout/landing-layout'

export const NotFoundErrorScreen: React.FC = () => {
  return (
    <LandingLayout>
      <div className='text-light d-flex align-items-center justify-content-center my-5'>
        <h1>404 Not Found <small>oops.</small></h1>
      </div>
    </LandingLayout>
  )
}
