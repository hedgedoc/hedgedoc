/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { ProviderType } from './provider-type.enum';

/**
 * The identity represents a single way for a user to login.
 * A 'user' can have any number of these.
 * Each one holds a type (local, github, etc.), if this type can have multiple instances (e.g. gitlab),
 * it also saves the name of the instance. Also if this identity shall be the syncSource is saved.
 */
@Entity()
export class Identity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * User that this identity corresponds to
   */
  @ManyToOne((_) => User, (user) => user.identities, {
    onDelete: 'CASCADE', // This deletes the Identity, when the associated User is deleted
  })
  user: Promise<User>;

  /**
   * The ProviderType of the identity
   */
  @Column()
  providerType: string;

  /**
   * The name of the provider.
   * Only set if there are multiple provider of that type (e.g. gitlab)
   */
  @Column({
    nullable: true,
    type: 'text',
  })
  providerName: string | null;

  /**
   * If the identity should be used as the sync source.
   * See [authentication doc](../../docs/content/dev/user_profiles.md) for clarification
   */
  @Column()
  syncSource: boolean;

  /**
   * When the identity was created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * When the identity was last updated.
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * The unique identifier of a user from the login provider
   */
  @Column({
    nullable: true,
    type: 'text',
  })
  providerUserId: string | null;

  /**
   * Token used to access the OAuth provider in the users name.
   */
  @Column({
    nullable: true,
    type: 'text',
  })
  oAuthAccessToken: string | null;

  /**
   * The hash of the password
   * Only set when the type of the identity is local
   */
  @Column({
    nullable: true,
    type: 'text',
  })
  passwordHash: string | null;

  public static create(
    user: User,
    providerType: ProviderType,
    syncSource: boolean,
  ): Omit<Identity, 'id' | 'createdAt' | 'updatedAt'> {
    const newIdentity = new Identity();
    newIdentity.user = Promise.resolve(user);
    newIdentity.providerType = providerType;
    newIdentity.providerName = null;
    newIdentity.syncSource = syncSource;
    newIdentity.providerUserId = null;
    newIdentity.oAuthAccessToken = null;
    newIdentity.passwordHash = null;
    return newIdentity;
  }
}
