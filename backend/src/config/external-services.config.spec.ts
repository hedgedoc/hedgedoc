/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import mockedEnv from 'mocked-env';

import externalServicesConfig from './external-services.config';

describe('externalServices', () => {
  const plantUmlServer = 'https://plantuml.example.com';
  const imageProxy = 'https://proxy.example.com';

  it('correctly parses valid config', () => {
    const restore = mockedEnv(
      {
        HD_PLANTUML_SERVER: plantUmlServer,
      },
      {
        clear: true,
      },
    );
    const config = externalServicesConfig();
    expect(config.plantumlServer).toEqual(plantUmlServer);
    restore();
  });

  describe('throws error', () => {
    let spyConsoleError: jest.Spied<typeof console.error>;
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

    it('when PlantUML server is configured with an invalid URL', () => {
      const invalid = 'wrong!';
      const restore = mockedEnv(
        {
          HD_PLANTUML_SERVER: invalid,
        },
        {
          clear: true,
        },
      );
      externalServicesConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_PLANTUML_SERVER: Invalid URL');
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when image proxy is configured', () => {
      const restore = mockedEnv(
        {
          HD_IMAGE_PROXY: imageProxy,
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
});
