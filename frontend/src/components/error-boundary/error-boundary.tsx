/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import links from '../../links.json'
import { Logger } from '../../utils/logger'
import frontendVersion from '../../version.json'
import { UiIcon } from '../common/icons/ui-icon'
import { ExternalLink } from '../common/links/external-link'
import type { ErrorInfo, PropsWithChildren, ReactNode } from 'react'
import React, { Component } from 'react'
import { Button, Container } from 'react-bootstrap'
import { ArrowRepeat as IconArrowRepeat } from 'react-bootstrap-icons'

const log = new Logger('ErrorBoundary')

/**
 * An error boundary for the whole application.
 * The text in this is not translated, because the error could be part of the translation framework,
 * and we still want to display something to the user that's meaningful (and searchable).
 */
export class ErrorBoundary extends Component<PropsWithChildren<unknown>> {
  state: {
    hasError: boolean
  }

  constructor(props: Readonly<unknown>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    log.error('Error catched', error, errorInfo)
  }

  refreshPage(): void {
    window.location.reload()
  }

  render(): ReactNode | undefined {
    if (this.state.hasError) {
      return (
        <Container className='text-light d-flex flex-column mvh-100'>
          <div className='text-light d-flex flex-column align-items-center justify-content-center my-5'>
            <h1>An unknown error occurred</h1>
            <p>
              Don&apos;t worry, this happens sometimes. If this is the first time you see this page then try reloading
              the app.
            </p>
            If you can reproduce this error, then we would be glad if you&#32;
            <ExternalLink
              text={'open an issue on github'}
              href={frontendVersion.issueTrackerUrl}
              className={'text-primary'}
            />
            &#32; or <ExternalLink text={'contact us on matrix.'} href={links.chat} className={'text-primary'} />
            <Button onClick={() => this.refreshPage()} title={'Reload App'} className={'mt-4'}>
              <UiIcon icon={IconArrowRepeat} />
              &nbsp;Reload App
            </Button>
          </div>
        </Container>
      )
    } else {
      return this.props.children
    }
  }
}
