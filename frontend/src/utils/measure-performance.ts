/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Uses the browser's performance API to measure how long a given task is running.
 *
 * @param measurementName The name of the measurement. Is also used to derive the name of the markers
 * @param task The task to run
 * @return the result of the task
 */
export const measurePerformance = <T = void>(measurementName: string, task: () => T): T => {
  if (!window.performance || !window.performance.mark || !window.performance.measure) {
    return task()
  }
  const startMarkName = `${measurementName} - start`
  const endMarkName = `${measurementName} - end`
  window.performance.mark(startMarkName)
  const result = task()
  window.performance.mark(endMarkName)
  window.performance.measure(measurementName, startMarkName, endMarkName)
  return result
}
