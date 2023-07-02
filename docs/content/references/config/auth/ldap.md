# LDAP

HedgeDoc can use one or multiple LDAP servers to authenticate users. To do this,
you first need to tell HedgeDoc the names of servers you want to use (`HD_AUTH_LDAPS`),
and then you need to provide the configuration for those LDAP servers
depending on how you want to use them.
Each of those variables will contain the given name for this LDAP server.
For example if you named your LDAP server `MY_LDAP` all variables for this server
will start with `HD_AUTH_LDAP_MY_LDAP`.

| environment variable                       | default              | example                                            | description                                                                                                   |
| ------------------------------------------ | -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `HD_AUTH_LDAPS`                            | -                    | `MY_LDAP`                                          | A comma-seperated list of names of LDAP servers HedgeDoc should use.                                          |
| `HD_AUTH_LDAP_$NAME_PROVIDER_NAME`         | `LDAP`               | `My LDAP`                                          | The display name for the LDAP server, that is shown in the UI of HegdeDoc.                                    |
| `HD_AUTH_LDAP_$NAME_URL`                   | -                    | `ldaps://ldap.example.com`                         | The url with which the LDAP server can be accessed.                                                           |
| `HD_AUTH_LDAP_$NAME_SEARCH_BASE`           | -                    | `ou=users,dc=LDAP,dc=example,dc=com`               | The LDAP search base which contains the user accounts on the LDAP server.                                     |
| `HD_AUTH_LDAP_$NAME_SEARCH_FILTER`         | `(uid={{username}})` | `(&(uid={{username}})(objectClass=inetOrgPerson))` | A LDAP search filter that filters the users that should have access.                                          |
| `HD_AUTH_LDAP_$NAME_SEARCH_ATTRIBUTES`     | -                    | `username,cn`                                      | A comma-seperated list of attributes that the search filter from the LDAP server should access.               |
| `HD_AUTH_LDAP_$NAME_USERID_FIELD`          | `uid`                | `uid`, `uidNumber`, `sAMAccountName`               | The attribute of the user account which should be used as an id for the user.                                 |
| `HD_AUTH_LDAP_$NAME_DISPLAY_NAME_FIELD`    | `displayName`        | `displayName`, `name`, `cn`                        | The attribute of the user account which should be used as the display name for the user.                      |
| `HD_AUTH_LDAP_$NAME_PROFILE_PICTURE_FIELD` | `jpegPhoto`          | `jpegPhoto`, `thumbnailPhoto`                      | The attribute of the user account which should be used as the user image for the user.                        |
| `HD_AUTH_LDAP_$NAME_BIND_DN`               | -                    | `cn=admin,dc=LDAP,dc=example,dc=com`               | The dn which is used to perform the user search. If this is omitted then HedgeDoc will use an anonymous bind. |
| `HD_AUTH_LDAP_$NAME_BIND_CREDENTIALS`      | -                    | `MyLdapPassword`                                   | The credential to access the LDAP server.                                                                     |
| `HD_AUTH_LDAP_$NAME_TLS_CERT_PATHS`        | -                    | `LDAP-ca.pem`                                      | A comma-seperated list of paths to TLS certificates for the LDAP server.
