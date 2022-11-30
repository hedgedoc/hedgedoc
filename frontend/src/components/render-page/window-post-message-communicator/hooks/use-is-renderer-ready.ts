/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Extracts the ready status of the renderer from the global application state.
 *
 * @return The current ready status of the renderer.
 */
export const useIsRendererReady = (): boolean => useApplicationState((state) => state.rendererStatus.rendererReady)
