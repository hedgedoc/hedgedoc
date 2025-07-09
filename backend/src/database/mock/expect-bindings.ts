/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Tracker } from 'knex-mock-client';

export const IS_FIRST = 1;

/**
 * Asserts that the mock db tracker contains change SQL entries with the specified bindings.
 * The method iterates through the complete change history of the tracker and compares all bindings of the specified SQL method.
 *
 * @param tracker The mock db tracker to check
 * @param method The SQL method used for the change
 * @param bindings The bindings to verify per SQL entry
 * @param usesFirst The call to select uses .first()
 * @param expectNotToBeCalled Ensures that a specific method was not called
 */
export function expectBindings(
  tracker: Tracker,
  method: 'insert' | 'update' | 'delete' | 'select',
  bindings: unknown[][],
  usesFirst: boolean = false,
  expectNotToBeCalled: boolean = false,
): void {
  const history = tracker.history[method];
  if (expectNotToBeCalled) {
    expect(history).toHaveLength(0);
    return;
  }
  if (usesFirst) {
    if (method !== 'select') {
      throw new Error(
        'Expected `select` as method if `usesFirst` is set to true',
      );
    }
    bindings[0].push(IS_FIRST);
  }
  expect(history).toHaveLength(bindings.length);
  for (let i = 0; i < bindings.length; i++) {
    expect(history[i].method).toBe(method);
    expect(history[i].bindings).toEqual(bindings[i]);
  }
}
