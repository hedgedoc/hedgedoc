/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { CustomizationConfig } from '../customization.config';

export function createDefaultMockCustomizationConfig(): CustomizationConfig {
  return {
    branding: {
      customName: 'ACME Corp',
      customLogo: '',
    },
    specialUrls: {
      privacy: 'https://md.example.org/test/privacy',
      termsOfUse: 'https://md.example.org/test/termsOfUse',
      imprint: 'https://md.example.org/test/imprint',
    },
  };
}

export function registerCustomizationConfig(
  customizationConfig: CustomizationConfig,
): ConfigFactory<CustomizationConfig> &
  ConfigFactoryKeyHost<CustomizationConfig> {
  return registerAs(
    'customizationConfig',
    (): CustomizationConfig => customizationConfig,
  );
}

export default registerCustomizationConfig(
  createDefaultMockCustomizationConfig(),
);
