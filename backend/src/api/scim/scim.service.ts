/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameUser, TableUser, User } from '@hedgedoc/database';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import SCIMMY from 'scimmy';

import { IdentityService } from '../../auth/identity.service';
import scimConfig, { ScimConfig } from '../../config/scim.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ScimService implements OnModuleInit {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private readonly usersService: UsersService,
    private readonly identityService: IdentityService,

    @Inject(scimConfig.KEY)
    private readonly scimConfiguration: ScimConfig,

    @InjectConnection()
    private readonly knex: Knex,
  ) {
    this.logger.setContext(ScimService.name);
  }

  onModuleInit(): void {
    SCIMMY.Resources.declare(SCIMMY.Resources.User)
      .ingress(
        this.handleIngress.bind(this) as SCIMMY.Types.Resource.IngressHandler<
          InstanceType<typeof SCIMMY.Resources.User>,
          SCIMMY.Schemas.User
        >,
      )
      .egress(
        this.handleEgress.bind(this) as SCIMMY.Types.Resource.EgressHandler<
          InstanceType<typeof SCIMMY.Resources.User>,
          SCIMMY.Schemas.User
        >,
      )
      .degress(this.handleDegress.bind(this));
  }

  /**
   * Handles SCIM user creation and update (ingress)
   */
  private async handleIngress(
    resource: InstanceType<typeof SCIMMY.Resources.User>,
    instance: SCIMMY.Schemas.User,
  ): Promise<Record<string, unknown>> {
    try {
      const data = instance as unknown as Record<string, unknown>;
      if (resource.id) {
        return await this.updateUser(resource.id, data);
      } else {
        return await this.createUser(data);
      }
    } catch (error) {
      if (error instanceof SCIMMY.Types.Error) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        throw new SCIMMY.Types.Error(404, '', `Resource ${resource.id} not found`);
      }
      if (errorMessage.includes('already') || errorMessage.includes('taken')) {
        throw new SCIMMY.Types.Error(409, 'uniqueness', errorMessage);
      }
      throw new SCIMMY.Types.Error(500, '', errorMessage);
    }
  }

  /**
   * Handles SCIM user retrieval (egress)
   */
  private async handleEgress(
    resource: InstanceType<typeof SCIMMY.Resources.User>,
  ): Promise<Record<string, unknown> | Record<string, unknown>[]> {
    try {
      if (resource.id) {
        const user = await this.usersService.getUserById(Number(resource.id));
        return this.userToScimResource(user);
      } else {
        return await this.listUsers();
      }
    } catch (error) {
      if (error instanceof SCIMMY.Types.Error) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        throw new SCIMMY.Types.Error(404, '', `Resource ${resource.id} not found`);
      }
      throw new SCIMMY.Types.Error(500, '', errorMessage);
    }
  }

  /**
   * Handles SCIM user deletion (degress)
   */
  private async handleDegress(resource: InstanceType<typeof SCIMMY.Resources.User>): Promise<void> {
    try {
      await this.usersService.deleteUser(Number(resource.id));
    } catch (error) {
      if (error instanceof SCIMMY.Types.Error) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        throw new SCIMMY.Types.Error(404, '', `Resource ${resource.id} not found`);
      }
      throw new SCIMMY.Types.Error(500, '', errorMessage);
    }
  }

  private async createUser(instance: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { username, displayName, email, photoUrl } = this.extractUserData(instance);

    if (!username) {
      throw new SCIMMY.Types.Error(400, 'invalidValue', 'userName is required');
    }

    const userId = await this.identityService.createUserWithIdentity(
      AuthProviderType.OIDC,
      this.scimConfiguration.providerIdentifier,
      username,
      username,
      displayName ?? username,
      email,
      photoUrl,
    );
    const user = await this.usersService.getUserById(userId);
    return this.userToScimResource(user);
  }

  private async updateUser(
    id: string,
    instance: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const userId = Number(id);
    const { displayName, email, photoUrl } = this.extractUserData(instance);

    const active = instance.active;
    if (active === false) {
      await this.usersService.deleteUser(userId);
      throw new SCIMMY.Types.Error(404, '', `Resource ${id} not found`);
    }

    await this.usersService.updateUser(
      userId,
      displayName ?? undefined,
      email ?? undefined,
      photoUrl ?? undefined,
    );
    const user = await this.usersService.getUserById(userId);
    return this.userToScimResource(user);
  }

  private async listUsers(): Promise<Record<string, unknown>[]> {
    const users = await this.knex(TableUser).select().whereNotNull(FieldNameUser.username);
    return users.map((user: User) => this.userToScimResource(user));
  }

  private extractUserData(instance: Record<string, unknown>): {
    username: string | null;
    displayName: string | null;
    email: string | null;
    photoUrl: string | null;
  } {
    const userName = instance.userName as string | undefined;

    let displayName: string | null = null;
    const name = instance.name as Record<string, string> | undefined;
    if (instance.displayName) {
      displayName = instance.displayName as string;
    } else if (name) {
      const parts = [name.givenName, name.familyName].filter(Boolean);
      displayName = parts.length > 0 ? parts.join(' ') : null;
    }

    let email: string | null = null;
    const emails = instance.emails as Array<Record<string, unknown>> | undefined;
    if (emails && emails.length > 0) {
      const primaryEmail = emails.find((e) => e.primary === true) ?? emails[0];
      email = (primaryEmail.value as string) ?? null;
    }

    let photoUrl: string | null = null;
    const photos = instance.photos as Array<Record<string, unknown>> | undefined;
    if (photos && photos.length > 0) {
      const primaryPhoto = photos.find((p) => p.primary === true) ?? photos[0];
      photoUrl = (primaryPhoto.value as string) ?? null;
    }

    return { username: userName ?? null, displayName, email, photoUrl };
  }

  private userToScimResource(user: User): Record<string, unknown> {
    const id = String(user[FieldNameUser.id]);
    const username = user[FieldNameUser.username] ?? id;
    const displayName = user[FieldNameUser.displayName];
    const email = user[FieldNameUser.email];
    const photoUrl = user[FieldNameUser.photoUrl];

    const resource: Record<string, unknown> = {
      id,
      userName: username,
      displayName: displayName ?? username,
      active: true,
      meta: {
        resourceType: 'User',
        created: user[FieldNameUser.createdAt],
        lastModified: user[FieldNameUser.createdAt],
      },
    };

    if (email) {
      resource.emails = [{ value: email, primary: true }];
    }

    if (photoUrl) {
      resource.photos = [{ value: photoUrl, type: 'photo' }];
    }

    const nameParts = (displayName ?? username).split(' ');
    resource.name = {
      formatted: displayName ?? username,
      givenName: nameParts[0],
      familyName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0],
    };

    return resource;
  }

  /**
   * Process a SCIM read request (GET single or list)
   */
  async readUser(id?: string, query?: Record<string, string>): Promise<unknown> {
    const config: Record<string, unknown> = {};
    if (query?.filter) {
      config.filter = query.filter;
    }
    if (query?.sortBy) {
      config.sortBy = query.sortBy;
    }
    if (query?.sortOrder) {
      config.sortOrder = query.sortOrder;
    }
    if (query?.startIndex) {
      config.startIndex = Number(query.startIndex);
    }
    if (query?.count) {
      config.count = Number(query.count);
    }
    if (query?.attributes) {
      config.attributes = query.attributes;
    }
    if (query?.excludedAttributes) {
      config.excludedAttributes = query.excludedAttributes;
    }

    const resource = new SCIMMY.Resources.User(id, config);
    return await resource.read();
  }

  /**
   * Process a SCIM write request (POST or PUT)
   */
  async writeUser(body: Record<string, unknown>, id?: string): Promise<unknown> {
    const resource = new SCIMMY.Resources.User(id);
    return await resource.write(body);
  }

  /**
   * Process a SCIM patch request
   */
  async patchUser(id: string, body: Record<string, unknown>): Promise<unknown> {
    const resource = new SCIMMY.Resources.User(id);
    return await resource.patch(body as Parameters<typeof resource.patch>[0]);
  }

  /**
   * Process a SCIM delete request
   */
  async deleteUser(id: string): Promise<void> {
    const resource = new SCIMMY.Resources.User(id);
    await resource.dispose();
  }

  /**
   * Get SCIM ServiceProviderConfig
   */
  getServiceProviderConfig(): Record<string, unknown> {
    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
      documentationUri: 'https://docs.hedgedoc.org',
      patch: { supported: true },
      bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
      filter: { supported: true, maxResults: 200 },
      changePassword: { supported: false },
      sort: { supported: true },
      etag: { supported: false },
      authenticationSchemes: [
        {
          type: 'oauthbearertoken',
          name: 'OAuth Bearer Token',
          description: 'Authentication scheme using the OAuth Bearer Token standard',
          specUri: 'https://www.rfc-editor.org/info/rfc6750',
        },
      ],
    };
  }

  /**
   * Get SCIM ResourceTypes
   */
  getResourceTypes(): unknown[] {
    const declared = SCIMMY.Resources.declared() as Record<string, typeof SCIMMY.Types.Resource>;
    return Object.values(declared).map((Resource) => Resource.describe());
  }

  /**
   * Get SCIM Schemas
   */
  getSchemas(): unknown[] {
    const declared = SCIMMY.Schemas.declared();
    return (declared as unknown as SCIMMY.Types.SchemaDefinition[]).map((schema) =>
      schema.describe(),
    );
  }
}
