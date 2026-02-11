# SCIM

HedgeDoc supports [SCIM 2.0](https://datatracker.ietf.org/doc/html/rfc7644) (System for Cross-domain Identity Management) for automated user provisioning and deprovisioning.
This allows identity providers like Microsoft Entra ID (formerly Azure AD), Okta, or other SCIM-compatible systems to automatically manage user accounts in HedgeDoc.

## Configuration

SCIM support is disabled by default. To enable it, configure the following environment variables:

| environment variable          | default | example                               | description                                                                                                                                    |
|-------------------------------|---------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `HD_SCIM_BEARER_TOKEN`        | -       | `your-secret-bearer-token-here`       | The bearer token used to authenticate SCIM requests. **Required** to enable SCIM. If not set, SCIM endpoints will return 401 Unauthorized.    |
| `HD_SCIM_PROVIDER_IDENTIFIER` | `scim`  | `entra-id`, `okta`, `custom-idp`      | Identifier for the SCIM provider. Used to distinguish identities created via SCIM from other authentication methods.                           |

## API endpoints

When SCIM is enabled, the following endpoints are available at `/api/scim/v2`:

### User management

- `GET /api/scim/v2/Users` - List all users
- `GET /api/scim/v2/Users/:id` - Get a specific user
- `POST /api/scim/v2/Users` - Create a new user
- `PUT /api/scim/v2/Users/:id` - Replace a user (full update)
- `PATCH /api/scim/v2/Users/:id` - Partially update a user
- `DELETE /api/scim/v2/Users/:id` - Delete a user

### Discovery endpoints

- `GET /api/scim/v2/ServiceProviderConfig` - Get SCIM service provider configuration
- `GET /api/scim/v2/ResourceTypes` - Get supported resource types
- `GET /api/scim/v2/Schemas` - Get SCIM schemas

## User mapping

SCIM user attributes are mapped to HedgeDoc user fields as follows:

| SCIM attribute         | HedgeDoc field | Notes                                                    |
|------------------------|----------------|----------------------------------------------------------|
| `id`                   | User ID        | Internal HedgeDoc user ID (numeric, converted to string) |
| `userName`             | `username`     | Required. Used as the unique username in HedgeDoc        |
| `displayName`          | `displayName`  | Display name shown in the UI                             |
| `emails[0].value`      | `email`        | Primary email address                                    |
| `photos[0].value`      | `photoUrl`     | Profile picture URL                                      |
| `active`               | -              | When set to `false`, the user is deleted (deprovisioned) |

## Limitations

- **Groups**: SCIM group management is not yet supported. Users can be assigned to HedgeDoc groups manually after provisioning.
- **Password sync**: Passwords cannot be set or synced via SCIM. Users provisioned via SCIM should authenticate using the identity provider (e.g., via OIDC/SAML).
- **Bulk operations**: Bulk SCIM operations are not supported.
