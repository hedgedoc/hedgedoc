/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import request from 'supertest';

import { PRIVATE_API_PREFIX } from '../../../src/app.module';
import {
  password1,
  password2,
  TestSetup,
  username1,
  username2,
} from '../../test-setup';

export async function setupAgentUsers(testSetup: TestSetup) {
  const agentGuestUser = request.agent(testSetup.app.getHttpServer());
  await agentGuestUser
    .post(`${PRIVATE_API_PREFIX}/auth/guest/register`)
    .send()
    .expect(200);

  const agentUser1 = request.agent(testSetup.app.getHttpServer());
  await agentUser1
    .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
    .send({ username: username1, password: password1 })
    .expect(201);

  const agentUser2 = request.agent(testSetup.app.getHttpServer());
  await agentUser2
    .post(`${PRIVATE_API_PREFIX}/auth/local/login`)
    .send({ username: username2, password: password2 })
    .expect(201);

  return {
    agentGuestUser,
    agentUser1,
    agentUser2,
  };
}
