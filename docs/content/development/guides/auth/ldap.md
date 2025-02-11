# LDAP

If you are developing HedgeDoc and need to test something with an LDAP server you can use the
[`test-openldap`][docker-image] Docker image from [rroemhild][rroemhild].

Simply run

<!-- markdownlint-disable proper-names -->
```shell
docker run --rm -p 10389:10389 -p 10636:10636 rroemhild/test-openldap
```
<!-- markdownlint-enable proper-names -->

and add the following to the `.env` file then start the backend.

```dotenv
HD_AUTH_LDAP_SERVERS="FUTURAMA"
HD_AUTH_LDAP_FUTURAMA_PROVIDER_NAME="Futurama LDAP"
HD_AUTH_LDAP_FUTURAMA_URL="ldap://localhost:10389"
HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE="ou=people,dc=planetexpress,dc=com"
HD_AUTH_LDAP_FUTURAMA_SEARCH_FILTER=(&(uid={{username}})(objectClass=inetOrgPerson))
HD_AUTH_LDAP_FUTURAMA_DISPLAY_NAME_FIELD="uid"
HD_AUTH_LDAP_FUTURAMA_USERID_FIELD="uid"
HD_AUTH_LDAP_FUTURAMA_BIND_DN="cn=admin,dc=planetexpress,dc=com"
HD_AUTH_LDAP_FUTURAMA_BIND_CREDENTIALS="GoodNewsEveryone"
```

You should be able to log in with either of these logins (`username` : `password`):

- `professor` : `professor`
- `fry` : `fry`
- `zoidberg` : `zoidberg`
- `hermes` : `hermes`
- `leela` : `leela`
- `bender` : `bender`
- `amy` : `amy`

If you need to know more about which information are held by each of these accounts, have a look at
the [documentation](https://github.com/rroemhild/docker-test-openldap#ldap-structure).

[docker-image]: https://github.com/rroemhild/docker-test-openldap
[rroemhild]: https://github.com/rroemhild
