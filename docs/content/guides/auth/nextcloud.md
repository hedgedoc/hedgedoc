# Authentication guide - Nextcloud (self-hosted)

*This has been constructed using
the [Nextcloud OAuth2 Documentation](https://docs.nextcloud.com/server/14/admin_manual/configuration_server/oauth2.html?highlight=oauth2)
combined
with [this issue comment on the nextcloud bugtracker](https://github.com/nextcloud/server/issues/5694#issuecomment-314761326)
.*

This guide uses the generic OAuth2 module for compatibility with Nextcloud 13 and above (this guide has been tested
successfully with Nextcloud 14 and Nextcloud 20).

1. Sign-in with an administrator account to your Nextcloud server

2. Navigate to the OAuth integration settings: Profile Icon (top right) --> Settings
   Then choose Security Settings from the *Administration* part of the list - Don't confuse this with Personal Security Settings, where you would change your personal password!
   At the top there's OAuth 2.0-Clients.  
   ![Where to find OAuth2 in Nextcloud](../../images/auth/nextcloud-oauth2-1-settings.png)

3. Add your HedgeDoc instance by giving it a *name* (perhaps HedgeDoc, but could be anything) and a *Redirection-URI*. The Redirection-URI will be `\<your-hedgedoc-url\>/auth/oauth2/callback`. Click <kbd>Add</kbd>.  
   ![Adding a client to Nextcloud](../../images/auth/nextcloud-oauth2-2-client-add.png)


4. You'll now see a line containing a *client identifier* and a *Secret*.
   ![Successfully added OAuth2-client](../../images/auth/nextcloud-oauth2-3-clientid-secret.png)

5. That's it for Nextcloud, the rest is configured in your HedgeDoc `config.json` or via the `CMD_` environment
   variables!

6. Add the Client ID and Client Secret to your `config.json` file or pass them as environment variables. Make sure you
   also replace `<your-nextcloud-domain>` with the right domain name.
  - `config.json`:

    ```json
    {
      "production": {
        "oauth2": {
            "clientID": "ii4p1u3jz7dXXXXXXXXXXXXXXX",
            "clientSecret": "mqzzx6fydbXXXXXXXXXXXXXXXX",
            "authorizationURL": "https://<your-nextcloud-domain>/apps/oauth2/authorize",
            "tokenURL": "https://<your-nextcloud-domain>/apps/oauth2/api/v1/token",
            "userProfileURL": "https://<your-nextcloud-domain>/ocs/v2.php/cloud/user?format=json",
            "userProfileUsernameAttr": "ocs.data.id",
            "userProfileDisplayNameAttr": "ocs.data.display-name",
            "userProfileEmailAttr": "ocs.data.email"
        }
      }
    }
    ```

  - environment variables:

    ```sh
    CMD_OAUTH2_CLIENT_ID=ii4p1u3jz7dXXXXXXXXXXXXXXX
    CMD_OAUTH2_CLIENT_SECRET=mqzzx6fydbXXXXXXXXXXXXXXXX
    CMD_OAUTH2_AUTHORIZATION_URL=https://<your-nextcloud-domain>/apps/oauth2/authorize
    CMD_OAUTH2_TOKEN_URL=https://<your-nextcloud-domain>/apps/oauth2/api/v1/token
    CMD_OAUTH2_USER_PROFILE_URL=https://<your-nextcloud-domain>/ocs/v2.php/cloud/user?format=json
    CMD_OAUTH2_USER_PROFILE_USERNAME_ATTR=ocs.data.id
    CMD_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR=ocs.data.display-name
    CMD_OAUTH2_USER_PROFILE_EMAIL_ATTR=ocs.data.email
    ```

!!! info
    If you are using a [CA not trusted by Node.js](https://github.com/nodejs/node/issues/4175) (like Let's Encrypt e.g) for your NextCloud instance you can set the [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#cli_node_extra_ca_certs_file) environment variable to the CA certificate file path of your CA.  
    Remember to also make the file available inside the Docker container, if you're running HedgeDoc in Docker container.
