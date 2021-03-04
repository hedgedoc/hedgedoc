# Troubleshooting Migrations

In some cases, HedgeDoc might apply migrations without correctly saving the progress.
In these cases, HedgeDoc will refuse to start with “already exists”-errors like
`ERROR: type "enum_Notes_permission" already exists`.

To fix these issues, manual intervention in the database is required:

1. Make sure you have a way to edit the database directly. For SQLite, PostgreSQL and MariaDB/MySQL, you can use the
    respective command-line tools `sqlite3`, `psql` and `mysql`.
2. Get the name of the failing migration and append `.js` to it.
    For example, if you encounter this error
    ```
    == 20180306150303-fix-enum: migrating =======

    ERROR: type "enum_Notes_permission" already exists
    ```
    the name of the failed migration would be `20180306150303-fix-enum.js`.
3. Make sure HedgeDoc does not run and insert the name into the `SequelizeMeta` table.  
   Ensure your database shell is connected to the HedgeDoc database. The SQL-statement may look like this: 
   ```sql
   INSERT INTO "SequelizeMeta" (name) VALUES ('20180306150303-fix-enum.js');
   ```
4. Start HedgeDoc again and observe if it starts correctly. It may be necessary to repeat this process 
    and insert multiple migrations into the `SequelizeMeta` table.
