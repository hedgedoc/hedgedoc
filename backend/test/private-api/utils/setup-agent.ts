/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';
import { PRIVATE_API_PREFIX } from '../../../src/app.module';
import { password1, password2, TestSetup, username1, username2 } from '../../test-setup';

/**
 * Extends a test agent to automatically include CSRF tokens in state-changing requests.
 * This is done by overriding the relevant HTTP methods of the agent.
 *
 * @param agent The agent to extend.
 * @returns The extended agent.
 */
export async function extendAgentWithCsrf(
  agent: request.SuperAgentTest,
): Promise<request.SuperAgentTest> {
  const csrfTokenResponse = await agent.get(`${PRIVATE_API_PREFIX}/csrf/token`).expect(200);
  const csrfToken = csrfTokenResponse.body.token;

  const originalPost = agent.post.bind(agent);
  const originalPut = agent.put.bind(agent);
  const originalPatch = agent.patch.bind(agent);
  const originalDelete = agent.delete.bind(agent);

  agent.post = (url: string) => originalPost(url).set('csrf-token', csrfToken);
  agent.put = (url: string) => originalPut(url).set('csrf-token', csrfToken);
  agent.patch = (url: string) => originalPatch(url).set('csrf-token', csrfToken);
  agent.delete = (url: string) => originalDelete(url).set('csrf-token', csrfToken);

  return agent;
}

export async function setupAgent(testSetup: TestSetup) {
  const originalAgentNotLoggedIn = request.agent(testSetup.app.getHttpServer());
  const agentNotLoggedIn = await extendAgentWithCsrf(originalAgentNotLoggedIn);

  const originalAgentGuestUser = request.agent(testSetup.app.getHttpServer());
  const agentGuestUser = await extendAgentWithCsrf(originalAgentGuestUser);
  await agentGuestUser.post(`${PRIVATE_API_PREFIX}/auth/guest/register`).send().expect(201);

  const originalAgentUser1 = request.agent(testSetup.app.getHttpServer());
  const agentUser1 = await extendAgentWithCsrf(originalAgentUser1);
  await agentUser1
    .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
    .send({ username: username1, password: password1 })
    .expect(201);

  const originalAgentUser2 = request.agent(testSetup.app.getHttpServer());
  const agentUser2 = await extendAgentWithCsrf(originalAgentUser2);
  await agentUser2
    .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
    .send({ username: username2, password: password2 })
    .expect(201);

  return [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2];
}
