# How to use other authentication methods

TODO: This pages is still missing some content.
See this issue for more information and if you want to contribute:
<https://github.com/hedgedoc/hedgedoc/issues/4830>

## Admin sessions

Registered accounts have an `admin` flag in the `user` table. It defaults to `false`
for all new accounts, including guest accounts. Currently, this flag can only be set
manually in the database.

When a user has the `admin` flag set to `true`, they can initiate an admin session.
Admin sessions allow to bypass all permission checks on notes and media uploads as
well as grant access to the admin panel. The admin session needs reauthentication
before it can be started.
User accounts with the `admin` flag which do not have an active admin session are
treated like regular users without access to the admin panel and with regular
permission checks being enforced.

To grant admin rights to an existing registered account, use the following SQL,
and replace `example` with the correct username.

```sql
UPDATE "user" SET admin = true WHERE username = 'example';
```
