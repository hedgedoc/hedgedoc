/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { ExternalServicesConfig } from '../external-services.config';

export function createDefaultMockExternalServicesConfig(): ExternalServicesConfig {
  return {
    plantUmlServer: 'plantuml.example.com',
    imageProxy: 'imageProxy.example.com',
  };
}

export function registerExternalServiceConfig(
  externalServicesConfig: ExternalServicesConfig,
): ConfigFactory<ExternalServicesConfig> &
  ConfigFactoryKeyHost<ExternalServicesConfig> {
  return registerAs(
    'externalServicesConfig',
    (): ExternalServicesConfig => externalServicesConfig,
  );
}

export default registerExternalServiceConfig(
  createDefaultMockExternalServicesConfig(),
);
