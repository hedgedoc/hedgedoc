/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { TestSetup, TestSetupBuilder } from '../test-setup';
import request from 'supertest';
import {extendAgentWithCsrf} from './utils/setup-agent'

describe('CSP Headers', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().build();
    await testSetup.init();
    const originalAgent = request.agent(testSetup.app.getHttpServer());
    agent = await extendAgentWithCsrf(originalAgent)
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe('CSP enabled (default)', () => {
    it('sets Content-Security-Policy header on API requests', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);
      expect(response.headers['content-security-policy']).toBeDefined();
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
    });

    it('includes secure script-src directive', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("script-src 'self'");
      expect(csp).not.toContain("'unsafe-eval'");
    });

    it('includes unsafe-inline for style-src (Next.js compatibility)', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('allows external image sources for embeds', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain('img-src');
      expect(csp).toContain('https://i.ytimg.com');
      expect(csp).toContain('https://i.vimeocdn.com');
    });

    it('allows YouTube and Vimeo in frame-src', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain('frame-src');
      expect(csp).toContain('https://www.youtube-nocookie.com');
      expect(csp).toContain('https://player.vimeo.com');
    });

    it('sets object-src to none', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("object-src 'none'");
    });

    it('sets form-action to self', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("form-action 'self'");
    });

    it('sets base-uri to self', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("base-uri 'self'");
    });

    it('includes upgrade-insecure-requests', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain('upgrade-insecure-requests');
    });
  });

  describe('Same domain scenario (HD_RENDERER_BASE_URL unset)', () => {
    it('allows self in frame-src', async () => {
      const response = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);

      const csp = response.headers['content-security-policy'];
      expect(csp).toContain('frame-src');
      expect(csp).toContain("'self'");
    });
  });
});
