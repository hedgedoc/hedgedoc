/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { RevisionConfig } from '../revision.config';

export function createDefaultMockRevisionConfig(): RevisionConfig {
  return {
    retentionDays: 0,
  };
}

export function registerRevisionConfig(
  revisionConfig: RevisionConfig,
): ConfigFactory<RevisionConfig> & ConfigFactoryKeyHost<RevisionConfig> {
  return registerAs('revisionConfig', (): RevisionConfig => revisionConfig);
}

export default registerRevisionConfig(createDefaultMockRevisionConfig());
