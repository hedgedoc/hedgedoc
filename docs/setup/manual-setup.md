# Manual Installation

## Requirements on your server

- Node.js 10.13 or up

- Database (PostgreSQL, MySQL, MariaDB, SQLite, MSSQL). Must use charset `utf8`: this is typically the
  default in PostgreSQL and SQLite, while in MySQL and MariaDB UTF-8 might need to be set with
  `alter database <DBNAME> character set utf8 collate utf8_bin;`
  Be aware of older MySQL and MariaDB versions which sometimes use shorter representations of UTF-8 than 4 bytes.
  This can break if symbols with more bytes are used.
  You can use `alter database <DBNAME> character set utf8mb4 COLLATE utf8mb4_unicode_ci` to be on the safe side.

- npm (and its dependencies, [node-gyp](https://github.com/nodejs/node-gyp#installation))

- yarn

- Bash (for the setup script)

- For **building** HedgeDoc we recommend to use a machine with at least **2GB** RAM

## Instructions

1. Check if you meet the [requirements at the top of this document](#requirements-on-your-server).

2. Clone this repository (preferred) or download a release and unzip it.

3. Enter the directory and type `bin/setup`, which will install npm dependencies and create configs.

4. Modify the file named `config.json` or configure HedgeDoc through environment variables which will overwrite the configs, see docs [here](https://github.com/hedgedoc/hedgedoc/blob/master/docs/configuration.md).

5. Build front-end bundle by `yarn run build` (use `yarn run dev` if you are in development)

6. Modify the file named `.sequelizerc`, change the value of the variable `url` with your db connection string. For example:
   - `postgres://username:password@localhost:5432/hedgedoc`
   - `mysql://username:password@localhost:3306/hedgedoc`
   - `sqlite://:memory:`

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
