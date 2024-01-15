/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { allAppExtensions } from '../../extensions/all-app-extensions'
import type { CheatsheetExtensionComponentProps } from './cheatsheet-extension'
import { isCheatsheetMultiEntry } from './cheatsheet-extension'
import type { ReactElement } from 'react'
import React, { Fragment, useMemo } from 'react'

/**
 * Generates react elements from components which are provided by cheatsheet extensions.
 */
export const useComponentsFromAppExtensions = (
  setContent: CheatsheetExtensionComponentProps['setContent']
): ReactElement => {
  return useMemo(() => {
    return (
      <Fragment key={'app-extensions'}>
        {allAppExtensions
          .flatMap((extension) => extension.buildCheatsheetExtensions())
          .flatMap((extension) => (isCheatsheetMultiEntry(extension) ? extension.topics : extension))
          .map((extension) => {
            if (extension.cheatsheetExtensionComponent) {
              return React.createElement(extension.cheatsheetExtensionComponent, { key: extension.i18nKey, setContent })
            }
          })}
      </Fragment>
    )
  }, [setContent])
}
