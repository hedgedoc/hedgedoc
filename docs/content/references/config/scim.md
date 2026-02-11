# SCIM

HedgeDoc supports [SCIM 2.0](https://datatracker.ietf.org/doc/html/rfc7644) (System for Cross-domain Identity Management) for automated user provisioning and deprovisioning. This allows identity providers like Microsoft Entra ID (formerly Azure AD), Okta, or other SCIM-compatible systems to automatically manage user accounts in HedgeDoc.

## Configuration

SCIM support is disabled by default. To enable it, configure the following environment variables:

| environment variable          | default | example                               | description                                                                                                                                    |
|-------------------------------|---------|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `HD_SCIM_BEARER_TOKEN`        | -       | `your-secret-bearer-token-here`       | The bearer token used to authenticate SCIM requests. **Required** to enable SCIM. If not set, SCIM endpoints will return 401 Unauthorized.    |
| `HD_SCIM_PROVIDER_IDENTIFIER` | `scim`  | `entra-id`, `okta`, `custom-idp`      | Identifier for the SCIM provider. Used to distinguish identities created via SCIM from other authentication methods.                           |

## Security considerations

- **Bearer token**: Use a strong, randomly generated token (e.g., 32+ characters). Keep this token secret and rotate it periodically.
- **HTTPS only**: SCIM endpoints should only be exposed over HTTPS. Configure your reverse proxy accordingly.
- **Network access**: Consider restricting access to SCIM endpoints at the firewall/reverse proxy level to only allow connections from your identity provider's IP ranges.

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

## Example: Microsoft Entra ID

1. In the Azure portal, go to **Enterprise applications** → **New application** → **Create your own application**
2. Select **Integrate any other application you don't find in the gallery (Non-gallery)**
3. After creating the app, go to **Provisioning** → **Get started**
4. Set **Provisioning Mode** to **Automatic**
5. Under **Admin Credentials**:
   - **Tenant URL**: `https://your-hedgedoc-instance.example.com/api/scim/v2`
   - **Secret Token**: The value of your `HD_SCIM_BEARER_TOKEN`
6. Click **Test Connection** to verify
7. Configure attribute mappings as needed (the default mappings should work)
8. Enable provisioning and assign users/groups to the application

## Example: Okta

1. In the Okta admin console, go to **Applications** → **Create App Integration**
2. Select **SWA - Secure Web Authentication** as the sign-in method
3. After creating the app, go to the **Provisioning** tab
4. Click **Configure API Integration**
5. Enable **API Integration** and enter:
   - **SCIM Base URL**: `https://your-hedgedoc-instance.example.com/api/scim/v2`
   - **Authorization**: Use **HTTP Header** with `Bearer your-secret-bearer-token-here`
6. Test the connection
7. Enable the desired provisioning features (Create Users, Update User Attributes, Deactivate Users)
8. Assign users to the application

## Limitations

- **Groups**: SCIM group management is not yet supported. Users can be assigned to HedgeDoc groups manually after provisioning.
- **Password sync**: Passwords cannot be set or synced via SCIM. Users provisioned via SCIM should authenticate using the identity provider (e.g., via OIDC/SAML).
- **Bulk operations**: Bulk SCIM operations are not supported.

## Troubleshooting

### SCIM endpoints return 401 Unauthorized

- Verify that `HD_SCIM_BEARER_TOKEN` is set in your environment
- Check that the `Authorization` header in requests uses the format: `Bearer <your-token>`
- Ensure the token matches exactly (no extra spaces or characters)

### Users are not being created

- Check the HedgeDoc backend logs for error messages
- Verify that the `userName` attribute is being sent in SCIM requests (it's required)
- Ensure usernames conform to HedgeDoc's username requirements (lowercase alphanumeric, hyphens, underscores, periods; 3-64 characters)

### Cannot distinguish SCIM users from other users

- Set `HD_SCIM_PROVIDER_IDENTIFIER` to a unique value for your identity provider
- This creates identities with that provider identifier, allowing you to identify which users were provisioned via SCIM
