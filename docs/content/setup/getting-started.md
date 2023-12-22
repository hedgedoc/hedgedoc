# Getting started

Thank you for choosing HedgeDoc!
To set up your instance follow these steps:

1. Choose an installation method and follow the instructions
2. [Configure your reverse proxy](https://docs.hedgedoc.org/guides/reverse-proxy/)
3. [Configure HedgeDoc](https://docs.hedgedoc.org/configuration/)
4. If you didn't disable [local accounts](/configuration/#email-local-account), you can use the "Sign In" button to
   create an account, login and start using HedgeDoc.

Follow us on <a href="https://social.hedgedoc.org/" target="_blank" rel="noreferer noopener">:fontawesome-brands-mastodon:{: .mastodon }Mastodon</a> for updates.

## Upgrading HedgeDoc

HedgeDoc follows [Semantic Versioning](https://semver.org/).  
This means that minor and patch releases should not introduce user-facing backwards-incompatible changes.

You can find more details about upgrading in the instructions of your installation method.

!!! warning
    Before you upgrade, **always read the release notes**.  
    You can find them on our [releases page](https://hedgedoc.org/releases/).

## Migrating from CodiMD & HackMD
Migrating from CodiMD <= 1.6.0 or HackMD <= 1.1.0 to HedgeDoc should be safe,
just make sure to read the release notes.  
A particular issue that has come up is when handling TLS connections using a reverse proxy.
You must [set the `X-Forwarded-Proto` header correctly](https://docs.hedgedoc.org/guides/reverse-proxy/#reverse-proxy-config).

Migrating from more recent versions of CodiMD is not guaranteed to work, although some community members
[reported success migrating from CodiMD 2.2](https://community.hedgedoc.org/t/solved-upgrade-from-dockerlized-codimd/271).
If you successfully migrated from other versions, please report your upgrade results in the [community forum](https://community.hedgedoc.org/).
