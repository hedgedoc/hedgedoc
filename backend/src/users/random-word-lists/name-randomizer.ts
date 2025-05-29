/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { adjectives, items } from './random-words';

/**
 * Generates a random name based on an adjective and a noun
 *
 * @returns the generated name
 */
export function generateRandomName(): string {
  const adjective = generateRandomWord(adjectives);
  const things = generateRandomWord(items);
  return `${adjective} ${things}`;
}

/**
 * Generates a random word from a given list and capitalizes the first letter
 *
 * @param list - The list of words to choose from
 * @returns a randomly selected word with the first letter capitalized
 */
function generateRandomWord(list: string[]): string {
  const index = Math.floor(Math.random() * list.length);
  const word = list[index];
  return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
}
