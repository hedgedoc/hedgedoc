# OAuth with Keycloak/Red Hat SSO (self-hosted)

## Prerequisites

This guide assumes you have run and configured Keycloak.
If you'd like to meet this prerequisite quickly, it can be achieved by running a `quay.io/keycloak/keycloak` container and attaching it to your network.
For details and quick-start command, take a look at [the Keycloak Docker documentation](https://www.keycloak.org/getting-started/getting-started-docker).
Where HTTPS is specified throughout, use HTTP instead. You may also have to specify the exposed port, 8080.

## Steps

1. Sign in to the administration portal for your Keycloak instance at <https://keycloak.example.com/admin/master/console>.

    > You may note that a separate realm is specified throughout this tutorial. It is best practice not to use the `master` realm, as it normally contains the realm-management client that federates access using the policies and permissions you can create.

2. Navigate to the client management page at <https://keycloak.example.com/admin/master/console/#/your-realm/clients> (admin permissions required)
3. Click **Create** to create a new client and fill out the registration form. You should set the “Root URL” to the fully qualified public URL of your HedgeDoc instance.
4. Click **Save**
5. Set the **Access Type** of the client to `confidential`. This will make your client require a client secret upon authentication.


### Additional steps to circumvent generic OAuth2 issue

1. Select Client Scopes from the sidebar, and begin to create a new client scope using the Create button.
2. Ensure that the **Name** field is set to `id`.
3. Create a new mapper under the Mappers tab. This should reference the User Property `id`. `Claim JSON Type` should be String and all switches below should be enabled. Save the mapper.
4. Go to the client you set up in the previous steps using the Clients page, then choose the Client Scopes tab. Apply the scope you've created. This should mitigate errors as seen in [hedgedoc/hedgedoc#56](https://github.com/hedgedoc/hedgedoc/issues/56), as the `/userinfo` endpoint should now bring back the user's ID under the `id` key as well as `sub`.

## Container Configuration

In the `docker-compose.yml` add the following environment variables to `app.environment:`

```yaml
  app:
    environment:
      - CMD_OAUTH2_USER_PROFILE_URL=https://keycloak.example.com/realms/your-realm/protocol/openid-connect/userinfo
      - CMD_OAUTH2_USER_PROFILE_USERNAME_ATTR=preferred_username
      - CMD_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR=name
      - CMD_OAUTH2_USER_PROFILE_EMAIL_ATTR=email
      - CMD_OAUTH2_TOKEN_URL=https://keycloak.example.com/realms/your-realm/protocol/openid-connect/token
      - CMD_OAUTH2_AUTHORIZATION_URL=https://keycloak.example.com/realms/your-realm/protocol/openid-connect/auth
      - CMD_OAUTH2_CLIENT_ID=<your client ID>
      - CMD_OAUTH2_CLIENT_SECRET=<your client secret, which you can find under the Credentials tab for your client>
      - CMD_OAUTH2_PROVIDERNAME=Keycloak
      - CMD_OAUTH2_SCOPE=openid email profile
      - CMD_DOMAIN=<hedgedoc.example.com>
      - CMD_PROTOCOL_USESSL=true
      - CMD_URL_ADDPORT=false
```

After running `docker-compose up -d` to apply your settings,
you should now be able to sign in to your HedgeDoc using your Keycloak.
