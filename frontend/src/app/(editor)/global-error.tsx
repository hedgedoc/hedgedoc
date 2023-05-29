'use client'

/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../components/common/icons/ui-icon'
import { ExternalLink } from '../../components/common/links/external-link'
import links from '../../links.json'
import React, { useEffect } from 'react'
import { Button, Container } from 'react-bootstrap'
import { ArrowRepeat as IconArrowRepeat } from 'react-bootstrap-icons'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <Container className='d-flex flex-column mvh-100'>
          <div className='d-flex flex-column align-items-center justify-content-center my-5'>
            <h1>An unknown error occurred</h1>
            <p>
              Don&apos;t worry, this happens sometimes. If this is the first time you see this page then try reloading
              the app.
            </p>
            If you can reproduce this error, then we would be glad if you{' '}
            <ExternalLink text={'open an issue on github'} href={links.issues} className={'text-primary'} /> or{' '}
            <ExternalLink text={'contact us on matrix.'} href={links.chat} className={'text-primary'} />
            <Button onClick={reset} title={'Reload App'} className={'mt-4'}>
              <UiIcon icon={IconArrowRepeat} />
              &nbsp;Reload App
            </Button>
          </div>
        </Container>
      </body>
    </html>
  )
}
