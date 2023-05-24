/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { adjectives, items } from './random-words';

/**
 * Generates a random names based on an adjective and a noun.
 *
 * @return the generated name
 */
export function generateRandomName(): string {
  const adjective = generateRandomWord(adjectives);
  const things = generateRandomWord(items);
  return `${adjective} ${things}`;
}

function generateRandomWord(list: string[]): string {
  const index = Math.floor(Math.random() * list.length);
  const word = list[index];
  return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
}
