# LDAP

LDAP authentication can be tested with the [`test-openldap`](https://github.com/rroemhild/docker-test-openldap) docker image from [rroemhild](https://github.com/rroemhild).

Simply run

```sh
docker run --rm -p 10389:10389 -p 10636:10636 rroemhild/test-openldap
```

and add the following to the `.env` file before starting the backend.

```
HD_AUTH_LDAPS="FUTURAMA"
HD_AUTH_LDAP_FUTURAMA_PROVIDER_NAME="Futurama LDAP"
HD_AUTH_LDAP_FUTURAMA_URL="ldap://localhost:10389"
HD_AUTH_LDAP_FUTURAMA_SEARCH_BASE="ou=people,dc=planetexpress,dc=com"
HD_AUTH_LDAP_FUTURAMA_SEARCH_FILTER=(&(uid={{username}})(objectClass=inetOrgPerson))
HD_AUTH_LDAP_FUTURAMA_USERNAME_FIELD="uid"
HD_AUTH_LDAP_FUTURAMA_USERID_FIELD="uid"
HD_AUTH_LDAP_FUTURAMA_BIND_DN="cn=admin,dc=planetexpress,dc=com"
HD_AUTH_LDAP_FUTURAMA_BIND_CREDENTIALS="GoodNewsEveryone"
```

You should then be able to log in with either of these logins (`username` : `password`):

- `professor` : `professor`
- `fry` : `fry`
- `zoidberg` : `zoidberg`
- `hermes` : `hermes`
- `leela` : `leela`
- `bender` : `bender`
- `amy` : `amy`

