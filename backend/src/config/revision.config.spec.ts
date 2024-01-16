/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import revisionConfig from './revision.config';

describe('revisionConfig', () => {
  const retentionDays = 30;

  describe('correctly parses config', () => {
    it('when given correct and complete environment variables', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_REVISION_RETENTION_DAYS: retentionDays.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = revisionConfig();
      expect(config.retentionDays).toEqual(retentionDays);
      restore();
    });

    it('when no HD_REVISION_RETENTION_DAYS is set', () => {
      const restore = mockedEnv(
        {},
        {
          clear: true,
        },
      );
      const config = revisionConfig();
      expect(config.retentionDays).toEqual(0);
      restore();
    });

  });

  describe('throws error', () => {
    it('when given a negative retention days', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_REVISION_RETENTION_DAYS: (-1).toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => revisionConfig()).toThrow(
        '"HD_REVISION_RETENTION_DAYS" must be greater than or equal to 0',
      );
      restore();
    });
  });
});
