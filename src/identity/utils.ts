/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { User } from '../users/user.entity';
import { Identity } from './identity.entity';
import { ProviderType } from './provider-type.enum';

/**
 * Get the first identity of a given type from the user
 * @param {User} user - the user to get the identity from
 * @param {ProviderType} providerType - the type of the identity
 * @return {Identity | undefined} the first identity of the user or undefined, if such an identity can not be found
 */
export async function getFirstIdentityFromUser(
  user: User,
  providerType: ProviderType,
): Promise<Identity | undefined> {
  const identities = await user.identities;
  if (identities === undefined) {
    return undefined;
  }
  return identities.find(
    (aIdentity) => aIdentity.providerType === providerType,
  );
}
