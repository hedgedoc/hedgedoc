/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import z from 'zod';

import { extractDescriptionFromZodIssue } from './zod-error-message';

const PREFIX = 'HD_TEST';

describe('zod error message', () => {
  describe('extractDescriptionFromZodSchema', () => {
    it('correctly builds an error message on a simple object', () => {
      const schema = z.object({
        port: z.number().describe('port').positive(),
      });

      const results = schema.safeParse({
        port: -1,
      });

      expect(results.error).toBeDefined();

      const errorMessages = results.error!.errors.map((issue) =>
        extractDescriptionFromZodIssue(issue, PREFIX),
      );
      expect(errorMessages).toHaveLength(1);
      expect(errorMessages[0]).toEqual(
        `${PREFIX}_PORT: Number must be greater than 0`,
      );
    });
    it('correctly builds an error message on an array object', () => {
      const schema = z.object({
        array: z.array(z.number().positive()).describe('array'),
      });

      const results = schema.safeParse({
        array: [1, -1],
      });

      expect(results.error).toBeDefined();

      const errorMessages = results.error!.errors.map((issue) =>
        extractDescriptionFromZodIssue(issue, PREFIX),
      );
      expect(errorMessages).toHaveLength(1);
      expect(errorMessages[0]).toEqual(
        `${PREFIX}_ARRAY[1]: Number must be greater than 0`,
      );
    });
  });
});
