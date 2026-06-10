# How to make your HedgeDoc instance production ready

If you run your own HedgeDoc instance at one point you should probably consider a few things and how you want to handle them.
In this guide we try to show you a few of those considerations and want to discuss what's best to do.

## Node Env

You want to start HedgeDoc with `NODE_ENV=production`. This tells HedgeDoc to run in production, log a bit less and use the production configuration in your config.json.

## HTTPS

You want to configure a reverse proxy that handles your HedgeDoc TLS termination. For this you should consult the [reverse proxy guide](reverse-proxy.md).  
Look also at the hsts options in our [configuration](../configuration.md#web-security-aspects) to specify what works for your setup.

## Uploads

Depending on your instance and your expected amount of usage you may want to configure a different upload backend or at the very least configure external monitoring for the filesystem folder where HedgeDoc should put uploads to account for any sudden increases in usage.

## Database

We strongly recommend you use a different database than SQLite for your production instance. If you're a single user instance this is probably fine, but a database server is typically more robust than a single sqlite.db file.

## Login

You should configure a production ready user backend. This can either be via LDAP, SAML or OAuth2 or you use one of HedgeDoc preset configurations for e.g. GitHub. Our username / password system works, but lacks many functionalities you probably want like two-factor-auth or self-service password resets. 

## Guest Users

When HegdeDoc was first written the internet was a different place. Back then allow anonymous usage of a service like HedgeDoc seemed like a cool idea.
Unfortunatly we don't live in that time anymore and anonymous usage is probably not the best idea anymore.  
To prevent anonyomous usage you should set `allowAnonymous` or `CMD_ALLOW_ANONYMOUS` to `false`. After that anonymous users are not able to create any notes.
You could set `allowAnonymousEdits` or `CMD_ALLOW_ANONYMOUS_EDITS` to `true` to allow anonymous users to edit pages where the note owner explicity allowed this.

## Default Note Permission

Depending on your needs to may want to change the default permissions of notes to something more strict. Per default everybody expect guests can write to the notes, but you may want to have a different default. See [this table](../references/permissions.md) to understand the different options.
Regardless of what you chose here, the users will be able to change this behavior.

## Metrics

Please be aware that HedgeDoc exposes a few metric endpoints `/status`, `/_health` and `/metrics`. You either want to disable the more verbose of these endpoints (`/status` and `/metrics`) via `enableStatsApi` or `CMD_ENABLE_STATS_API` or configure your reverse proxy to only route these endpoints to a private network that your metrics grabber has access to.

## Backup

We recommend keeping backups of your instance in case something fails allong the lines. These backups should include:

- Your database
- Your uploads
- Your configuration
