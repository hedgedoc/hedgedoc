# Manual Installation

!!! info "Requirements on your server"
    - Node.js 10.13 or higher
    - Database (PostgreSQL, MySQL, MariaDB, SQLite, MSSQL)  
      The database must use charset `utf8`. This is typically the default in PostgreSQL and SQLite.  
      In MySQL and MariaDB UTF-8 might need to be set with `alter database <DBNAME> character set utf8 collate utf8_bin;`  
      Be aware of older MySQL and MariaDB versions which sometimes use shorter representations of UTF-8 than 4 bytes.
      This can break if symbols with more bytes are used.
      You can use `alter database <DBNAME> character set utf8mb4 COLLATE utf8mb4_unicode_ci` to be on the safe side.
    - NPM (and its dependencies, [node-gyp](https://github.com/nodejs/node-gyp#installation))
    - [Yarn Classic](https://classic.yarnpkg.com) 1.22 or higher (Yarn 2 is currently not supported)
    - Bash (for the setup script)
    - For **building** the HedgeDoc frontend you need a machine with at least **2 GB** RAM.
      - Starting with release 1.7 the release tarball includes the prebuilt frontend, so building it yourself is not necessary.

1. Check if you meet the [requirements at the top of this document](#manual-installation).
2. Download the [latest release](https://hedgedoc.org/latest-release/) and extract it.  
   <small>Alternatively, you can use Git to clone the repository and checkout a release, e.g. with `git clone -b 1.7.2 https://github.com/hedgedoc/hedgedoc.git`.</small>
3. Enter the directory and type `bin/setup`, which will install the dependencies and create example configs.
4. Configure HedgeDoc: You can either use the `config.json` file or environment variables.  
   For details, have a look at [the configuration documentation](../configuration.md).
5. *:octicons-light-bulb-16: If you used the release tarball for 1.7.0 or newer, this step can be skipped.*  
   Build the frontend bundle by running `yarn run build`.
6. It is recommended to start your server manually once:  
   ```shell
   NODE_ENV=production yarn start
   ```
   This way it's easier to see warnings or errors that might occur.  
   <small>You can leave out `NODE_ENV=production` for development.</small>
7. Run the server as you like (node, forever, pm2, SystemD, Init-Scripts)

## Upgrading

!!! warning
    Before you upgrade, **always read the release notes**.  
    You can find them on our [releases page](https://hedgedoc.org/releases/).

If you are upgrading HedgeDoc from an older version, follow these steps:

1. Check if you still meet the [requirements at the top of this document](#requirements-on-your-server).
2. Ensure you read the [release notes](https://hedgedoc.org/releases/) of all versions between your current version
   and the latest release.
2. Fully stop your old HedgeDoc server.
3. [Download](https://hedgedoc.org/latest-release/) the new release and extract it over the old directory.  
   <small>If you use Git, you can check out the new tag with e.g. `git fetch origin && git checkout 1.7.2`</small>
5. Run `bin/setup`. This will take care of installing dependencies. It is safe to run on an existing installation.
6. *:octicons-light-bulb-16: If you used the release tarball for 1.7.0 or newer, this step can be skipped.*  
   Build the frontend bundle by running `yarn run build`.
7. It is recommended to start your server manually once:
   ```shell
   NODE_ENV=production yarn start
   ```
   This way it's easier to see warnings or errors that might occur.
8. You can now restart the HedgeDoc server!
