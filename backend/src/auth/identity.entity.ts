/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ProviderType } from '@hedgedoc/commons';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

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
   * The identifier of the provider.
   * Only set if there are multiple providers of that type (e.g. OIDC)
   */
  @Column({
    nullable: true,
    type: 'text',
  })
  providerIdentifier: string | null;

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
    providerIdentifier: string | null,
  ): Omit<Identity, 'id' | 'createdAt' | 'updatedAt'> {
    const newIdentity = new Identity();
    newIdentity.user = Promise.resolve(user);
    newIdentity.providerType = providerType;
    newIdentity.providerIdentifier = providerIdentifier;
    newIdentity.providerUserId = null;
    newIdentity.passwordHash = null;
    return newIdentity;
  }
}
