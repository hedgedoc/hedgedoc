Migrations and Notable Changes
===

## Migrating to 1.4.0

We dropped support for node 6 with this version. If you have any trouble running this version, please double check that you are running at least node 8!

## Migrating to 1.3.2

This is not a breaking change, but to stay up to date with the community
repository, you may need to update a few urls. This is not a breaking change.

See more at [issue #10](https://github.com/codimd/server/issues/10)

**Native setup using git:**

Change the upstream remote using `git remote set-url origin https://github.com/codimd/server.git`.

**Docker:**

When you use our [container repository](https://github.com/codimd/container) 
(which was previously `codimd-container`) all you can simply run `git pull` and
your `docker-compose.yml` will be updated.

When you setup things yourself, make sure you use the new image:
[`quay.io/codimd/server`](https://quay.io/repository/codimd/server?tab=tags).

**Heroku:**

All you need to do is [disconnect GitHub](https://devcenter.heroku.com/articles/github-integration#disconnecting-from-github)
and [reconnect it](https://devcenter.heroku.com/articles/github-integration#enabling-github-integration)
with this new repository.

Or you can use our Heroku button and redeploy your instance and link the old
database again.

## Migrating to 1.1.0

We deprecated the older lower case config style and moved on to camel case style. Please have a look at the current `config.json.example` and check the warnings on startup.

*Notice: This is not a breaking change right now but will be in the future*

## Migrating to 0.5.0

[migration-to-0.5.0 migration tool](https://github.com/hackmdio/migration-to-0.5.0)

We don't use LZString to compress socket.io data and DB data after version 0.5.0.
Please run the migration tool if you're upgrading from the old version.

## Migrating to 0.4.0

[migration-to-0.4.0 migration tool](https://github.com/hackmdio/migration-to-0.4.0)

We've dropped MongoDB after version 0.4.0.
So here is the migration tool for you to transfer the old DB data to the new DB.
This tool is also used for official service.
