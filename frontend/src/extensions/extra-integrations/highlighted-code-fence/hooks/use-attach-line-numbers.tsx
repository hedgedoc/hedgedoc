/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react'
import { Fragment, useMemo } from 'react'
import styles from '../highlighted-code.module.scss'
import { cypressId } from '../../../../utils/cypress-attribute'

/**
 * Wraps the given {@link ReactElement elements} to attach line numbers to them.
 *
 * @param lines The elements to wrap
 * @param startLineNumber The line number to start with. Will default to 1 if omitted.
 */
export const useAttachLineNumbers = (
  lines: undefined | ReactElement[],
  startLineNumber = 1
): undefined | ReactElement[] =>
  useMemo(
    () =>
      lines?.map((line, index) => (
        <Fragment key={index}>
          <span {...cypressId('linenumber')} className={styles['linenumber']}>
            {startLineNumber + index}
          </span>
          <div {...cypressId('codeline')} className={styles['codeline']}>
            {line}
          </div>
        </Fragment>
      )),
    [startLineNumber, lines]
  )
