/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import customizationConfig from './customization.config';

describe('customizationConfig', () => {
  const customName = 'test name';
  const customLogo = 'https://example.com/logo.png';
  const privacyUrl = 'https://privacy.example.com';
  const termsOfUseUrl = 'https://termsOfUse.example.com';
  const imprintUrl = 'https://imprint.example.com';
  const invalidCustomLogo = 'example.com/logo.png';
  const invalidPrivacyUrl = 'privacy.example.com';
  const invalidTermsOfUseUrl = 'termsOfUse.example.com';
  const invalidImprintUrl = 'imprint.example.com';

  it('correctly parses valid config', () => {
    const restore = mockedEnv(
      {
        /* eslint-disable @typescript-eslint/naming-convention */
        HD_CUSTOM_NAME: customName,
        HD_CUSTOM_LOGO: customLogo,
        HD_PRIVACY_URL: privacyUrl,
        HD_TERMS_OF_USE_URL: termsOfUseUrl,
        HD_IMPRINT_URL: imprintUrl,
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    const config = customizationConfig();
    expect(config.branding.customName).toEqual(customName);
    expect(config.branding.customLogo).toEqual(customLogo);
    expect(config.specialUrls.privacy).toEqual(privacyUrl);
    expect(config.specialUrls.termsOfUse).toEqual(termsOfUseUrl);
    expect(config.specialUrls.imprint).toEqual(imprintUrl);
    restore();
  });

  it('throws an error if anything is wrongly configured', () => {
    const restore = mockedEnv(
      {
        /* eslint-disable @typescript-eslint/naming-convention */
        HD_CUSTOM_NAME: customName,
        HD_CUSTOM_LOGO: invalidCustomLogo,
        HD_PRIVACY_URL: invalidPrivacyUrl,
        HD_TERMS_OF_USE_URL: invalidTermsOfUseUrl,
        HD_IMPRINT_URL: invalidImprintUrl,
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    expect(() => customizationConfig()).toThrow(
      `- HD_BRANDING_CUSTOM_LOGO: Invalid url
 - HD_SPECIAL_URLS_PRIVACY: Invalid url
 - HD_SPECIAL_URLS_TERMS_OF_USE: Invalid url
 - HD_SPECIAL_URLS_IMPRINT: Invalid url`,
    );
    restore();
  });
});
