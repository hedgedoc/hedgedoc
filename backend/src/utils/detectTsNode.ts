/*
 * SPDX-FileCopyrightText: 2018 Martin Adámek
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Stolen from https://github.com/mikro-orm/mikro-orm/blob/20179ec839def5f8144e56f3a6bc89131f7e72a4/packages/core/src/utils/Utils.ts#L689
 */
export function detectTsNode(): boolean {
  return (
    process.argv[0].endsWith('ts-node') || // running via ts-node directly
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TS7053
    !!process[Symbol.for('ts-node.register.instance')] || // check if internal ts-node symbol exists
    !!process.env.TS_JEST || // check if ts-jest is used (works only with v27.0.4+)
    process.argv.slice(1).some((arg) => arg.includes('ts-node')) || // registering ts-node runner
    (require.extensions && !!require.extensions['.ts'])
  ); // check if the extension is registered
}
