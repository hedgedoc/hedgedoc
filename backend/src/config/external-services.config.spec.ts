/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import externalServicesConfig from './external-services.config';

describe('externalServices', () => {
  const plantUmlServer = 'https://plantuml.example.com';
  const imageProxy = 'https://proxy.example.com';

  it('correctly parses valid config', () => {
    const restore = mockedEnv(
      {
        /* eslint-disable @typescript-eslint/naming-convention */
        HD_PLANTUML_SERVER: plantUmlServer,
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    const config = externalServicesConfig();
    expect(config.plantumlServer).toEqual(plantUmlServer);
    restore();
  });

  it('throws an error if PlantUML server is configured with an invalid URL', () => {
    const invalid = 'wrong!';
    const restore = mockedEnv(
      {
        /* eslint-disable @typescript-eslint/naming-convention */
        HD_PLANTUML_SERVER: invalid,
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    expect(() => externalServicesConfig()).toThrow(
      'HD_PLANTUML_SERVER: Invalid url',
    );
    restore();
  });

  it('throws an error if image proxy is configured', () => {
    const restore = mockedEnv(
      {
        /* eslint-disable @typescript-eslint/naming-convention */
        HD_IMAGE_PROXY: imageProxy,
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    expect(() => externalServicesConfig()).toThrow(
      "HD_IMAGE_PROXY is currently not yet supported. Please don't configure it",
    );
    restore();
  });
});
