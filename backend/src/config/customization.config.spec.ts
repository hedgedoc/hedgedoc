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
        HD_BRANDING_CUSTOM_NAME: customName,
        HD_BRANDING_CUSTOM_LOGO: customLogo,
        HD_URLS_PRIVACY: privacyUrl,
        HD_URLS_TERMS_OF_USE: termsOfUseUrl,
        HD_URLS_IMPRINT: imprintUrl,
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    const config = customizationConfig();
    expect(config.branding.customName).toEqual(customName);
    expect(config.branding.customLogo).toEqual(customLogo);
    expect(config.urls.privacy).toEqual(privacyUrl);
    expect(config.urls.termsOfUse).toEqual(termsOfUseUrl);
    expect(config.urls.imprint).toEqual(imprintUrl);
    restore();
  });

  describe('throws error', () => {
    let spyConsoleError: jest.SpyInstance;
    let spyProcessExit: jest.Mock;
    let originalProcess: typeof process;

    beforeEach(() => {
      spyConsoleError = jest.spyOn(console, 'error');
      spyProcessExit = jest.fn();
      originalProcess = global.process;
      global.process = {
        ...originalProcess,
        exit: spyProcessExit,
      } as unknown as typeof global.process;
    });

    afterEach(() => {
      global.process = originalProcess;
      jest.restoreAllMocks();
    });

    it('when anything is wrongly configured', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_BRANDING_CUSTOM_NAME: customName,
          HD_BRANDING_CUSTOM_LOGO: invalidCustomLogo,
          HD_URLS_PRIVACY: invalidPrivacyUrl,
          HD_URLS_TERMS_OF_USE: invalidTermsOfUseUrl,
          HD_URLS_IMPRINT: invalidImprintUrl,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      customizationConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        '- HD_BRANDING_CUSTOM_LOGO: Invalid url',
      );
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        '- HD_URLS_PRIVACY: Invalid url',
      );
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        '- HD_URLS_TERMS_OF_USE: Invalid url',
      );
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        '- HD_URLS_IMPRINT: Invalid url',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});
