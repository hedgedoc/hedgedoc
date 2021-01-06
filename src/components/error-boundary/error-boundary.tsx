/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Component, ErrorInfo, ReactElement, ReactNodeArray } from 'react'
import { Button, Container } from 'react-bootstrap'
import links from '../../links.json'
import frontendVersion from '../../version.json'
import { ForkAwesomeIcon } from '../common/fork-awesome/fork-awesome-icon'
import { ExternalLink } from '../common/links/external-link'

export class ErrorBoundary extends Component {
  state: {
    hasError: boolean
  }

  constructor (props: Readonly<unknown>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError (_error: Error): { hasError: boolean } {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch (error: Error, errorInfo: ErrorInfo): void {
    console.error('error caught', error)
    console.error('additional information', errorInfo)
  }

  refreshPage (): void {
    window.location.reload()
  }

  render (): ReactElement | undefined | null | string | number | boolean | Record<string, unknown> | ReactNodeArray {
    if (this.state.hasError) {
      return (
        <Container className="text-light d-flex flex-column mvh-100">
          <div className='text-light d-flex flex-column align-items-center justify-content-center my-5'>
            <h1>An unknown error occurred</h1>
            <p>Don't worry, this happens sometimes. If this is the first time you see this page then try reloading the app.</p>
            If you can reproduce this error, then we would be glad if you&#32;
            <ExternalLink text={'open an issue on github'} href={frontendVersion.issueTrackerUrl} className={'text-primary'}/>&#32;
            or <ExternalLink text={'contact us on matrix.'} href={links.chat} className={'text-primary'}/>
            <Button onClick={() => this.refreshPage()} title={'Reload App'} className={'mt-4'}>
              <ForkAwesomeIcon icon={'refresh'}/>&nbsp;Reload App
            </Button>
          </div>
        </Container>
      )
    }
    return this.props.children
  }
}
