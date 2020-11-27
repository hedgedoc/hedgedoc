# Manual Installation

## Requirements on your server

- Node.js 10.13 or up
- Database (PostgreSQL, MySQL, MariaDB, SQLite, MSSQL)  
  The database must use charset `utf8`. This is typically the default in PostgreSQL and SQLite.  
  In MySQL and MariaDB UTF-8 might need to be set with `alter database <DBNAME> character set utf8 collate utf8_bin;`  
  Be aware of older MySQL and MariaDB versions which sometimes use shorter representations of UTF-8 than 4 bytes.
  This can break if symbols with more bytes are used.
  You can use `alter database <DBNAME> character set utf8mb4 COLLATE utf8mb4_unicode_ci` to be on the safe side.
- NPM (and its dependencies, [node-gyp](https://github.com/nodejs/node-gyp#installation))
- Yarn
- Bash (for the setup script)
- For **building** the HedgeDoc frontend you need a machine with at least **2 GB** RAM.
    - Starting with release 1.7 the release tarball includes the frontend, so building it yourself is not necessary.

## Instructions

1. Check if you meet the [requirements at the top of this document](#requirements-on-your-server).
2. Download a [release](https://github.com/hedgedoc/hedgedoc/releases) tarball and extract it.
   Alternatively, you can use Git to clone the repository and checkout a release, e.g. with `git clone -b 1.7.0 https://github.com/hedgedoc/hedgedoc.git`.
3. Enter the directory and type `bin/setup`, which will install the dependencies and create configs.
4. Modify the file named `config.json` or configure HedgeDoc through environment variables which will overwrite the configs, see docs [here](https://github.com/hedgedoc/hedgedoc/blob/master/docs/configuration.md).
5. **If using the release tarball for 1.7.0 or newer, this step can be skipped.**  
   Build the frontend bundle by `yarn run build` (use `yarn run dev` if you are in development)
6. Modify the file named `.sequelizerc`, change the value of the variable `url` to your db connection string. For example:
   - `postgres://username:password@localhost:5432/hedgedoc`
   - `mysql://username:password@localhost:3306/hedgedoc`
   - `sqlite:///opt/hedgedoc/hedgedoc.sqlite` (note that you need to use an absolute path to the SQLite file)
7. It is recommended to start your server manually once: `NODE_ENV=production yarn start`, this way it's easier to see warnings or errors that might occur (leave out `NODE_ENV=production` for development).
8. Run the server as you like (node, forever, pm2, SystemD, Init-Scripts)

## How to upgrade your installation

If you are upgrading HedgeDoc from an older version, follow these steps:

1. Check if you meet the [requirements at the top of this document](#requirements-on-your-server).
2. Verify which version you were running before and take a look at [migrations and breaking changes](../guides/migrations-and-breaking-changes.md) to see if additional steps, or configuration changes are necessary!
3. Fully stop your old HedgeDoc server.
4. `git pull` or unzip a new release in the directory.
5. Run `bin/setup`. This will take care of installing dependencies. It is safe to run on an existing installation.
6. Build front-end bundle by `yarn run build` (use `yarn run dev` if you are in development).
7. It is recommended to start your server manually once: `NODE_ENV=production yarn start`, this way it's easier to see warnings or errors that might occur (leave out `NODE_ENV=production` for development).
8. You can now restart the HedgeDoc server!
