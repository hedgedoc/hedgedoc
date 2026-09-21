'use client'

/*
 SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NextPage } from 'next'
import React from 'react'
import { TwoColumnLayout } from '../../../components/layout/two-column-layout'
import { CustomBranding } from '../../../components/common/custom-branding/custom-branding'
import { IntroCustomContent } from '../../../components/intro-page/intro-custom-content'
import { EditorToRendererCommunicatorContextProvider } from '../../../components/editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { Trans, useTranslation } from 'react-i18next'
import { InstanceVersion } from '../../../components/about-page/instance-version'
import { ProjectLinks } from '../../../components/about-page/project-links'
import { SocialLinks } from '../../../components/about-page/social-links'
import { MotdCard } from '../../../components/about-page/motd-card'

/**
 * About page
 */
const AboutPage: NextPage = () => {
  useTranslation()

  return (
    <TwoColumnLayout
      leftSide={
        <EditorToRendererCommunicatorContextProvider>
          <div className={'d-flex flex-column align-items-center mt-3'}>
            <h2>
              <Trans i18nKey='about.heading' />
            </h2>
            <div className={'mb-5'}>
              <CustomBranding />
            </div>
            <IntroCustomContent />
          </div>
        </EditorToRendererCommunicatorContextProvider>
      }>
      <MotdCard />
      <InstanceVersion />
      <ProjectLinks />
      <SocialLinks />
    </TwoColumnLayout>
  )
}

export default AboutPage
