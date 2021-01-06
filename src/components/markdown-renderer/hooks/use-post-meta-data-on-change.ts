/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import { useEffect, useRef } from 'react'
import { RawYAMLMetadata, YAMLMetaData } from '../../editor/yaml-metadata/yaml-metadata'

export const usePostMetaDataOnChange = (
  rawMetaRef: RawYAMLMetadata|undefined,
  firstHeadingRef: string|undefined,
  onMetaDataChange?: (yamlMetaData: YAMLMetaData | undefined) => void,
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
): void => {
  const oldMetaRef = useRef<RawYAMLMetadata>()
  const oldFirstHeadingRef = useRef<string>()

  useEffect(() => {
    if (onMetaDataChange && !equal(oldMetaRef.current, rawMetaRef)) {
      if (rawMetaRef) {
        const newMetaData = new YAMLMetaData(rawMetaRef)
        onMetaDataChange(newMetaData)
      } else {
        onMetaDataChange(undefined)
      }
      oldMetaRef.current = rawMetaRef
    }
    if (onFirstHeadingChange && !equal(firstHeadingRef, oldFirstHeadingRef.current)) {
      onFirstHeadingChange(firstHeadingRef || undefined)
      oldFirstHeadingRef.current = firstHeadingRef
    }
  })
}
