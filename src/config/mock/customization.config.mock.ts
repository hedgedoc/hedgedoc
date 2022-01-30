/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';

import { CustomizationConfig } from '../customization.config';

export default registerAs(
  'customizationConfig',
  (): CustomizationConfig => ({
    branding: {
      customName: 'ACME Corp',
      customLogo: '',
    },
    specialUrls: {
      privacy: '/test/privacy',
      termsOfUse: '/test/termsOfUse',
      imprint: '/test/imprint',
    },
  }),
);
