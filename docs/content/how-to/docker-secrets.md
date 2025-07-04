# Using Docker Secrets with HedgeDoc

HedgeDoc supports Docker secrets for securely managing sensitive configuration values like database credentials, API keys, and session secrets. This guide explains how to configure HedgeDoc using Docker secrets.

## What are Docker Secrets?

Docker secrets provide a secure way to store sensitive information that your application needs at runtime. Instead of passing sensitive data through environment variables (which might be visible in container inspection or logs), Docker secrets store this information in encrypted files that are only accessible within the container.

## How HedgeDoc Uses Docker Secrets

HedgeDoc automatically checks for secrets in the standard Docker secrets location (`/run/secrets/`) and uses them to configure the application. This is handled by the `dockerSecret.js` module in the HedgeDoc codebase.

Unlike some other Docker applications that use the `_FILE` suffix pattern for environment variables, HedgeDoc uses predefined secret names. This means you need to create secrets with specific names (listed below) rather than pointing environment variables to files.

### Implementation Details

When HedgeDoc starts, it:

1. Checks if the `/run/secrets/` directory exists
2. If it exists, looks for files with specific names in that directory
3. Reads the content of those files and uses them as configuration values
4. Falls back to environment variables if a secret file is not found

This approach is different from the common Docker pattern of using environment variables with a `_FILE` suffix (e.g., `DB_PASSWORD_FILE`), so it's important to use the exact secret names as specified in this documentation.

## Available Secret Names

HedgeDoc looks for the following secret names. It's important to use these exact names (including case sensitivity) as they are hardcoded in the application:

| Secret Name | Description |
|-------------|-------------|
| `dbURL` | Database connection URL |
| `sessionsecret` | Secret for session encryption |
| `sslkeypath` | Path to SSL key file |
| `sslcertpath` | Path to SSL certificate file |
| `sslcapath` | Path to SSL CA file |
| `dhparampath` | Path to DH parameters file |
| `s3_acccessKeyId` | AWS S3 access key ID |
| `s3_secretAccessKey` | AWS S3 secret access key |
| `azure_connectionString` | Azure storage connection string |
| `facebook_clientID` | Facebook OAuth client ID |
| `facebook_clientSecret` | Facebook OAuth client secret |
| `twitter_consumerKey` | Twitter OAuth consumer key |
| `twitter_consumerSecret` | Twitter OAuth consumer secret |
| `github_clientID` | GitHub OAuth client ID |
| `github_clientSecret` | GitHub OAuth client secret |
| `gitlab_clientID` | GitLab OAuth client ID |
| `gitlab_clientSecret` | GitLab OAuth client secret |
| `mattermost_clientID` | Mattermost OAuth client ID |
| `mattermost_clientSecret` | Mattermost OAuth client secret |
| `dropbox_clientID` | Dropbox OAuth client ID |
| `dropbox_clientSecret` | Dropbox OAuth client secret |
| `dropbox_appKey` | Dropbox app key |
| `google_clientID` | Google OAuth client ID |
| `google_clientSecret` | Google OAuth client secret |
| `google_hostedDomain` | Google OAuth hosted domain |
| `imgur_clientid` | Imgur client ID |
| `oauth2_clientID` | Generic OAuth2 client ID |
| `oauth2_clientSecret` | Generic OAuth2 client secret |

## Setting Up Docker Secrets with Docker Compose

Here's an example of how to use Docker secrets with HedgeDoc in a Docker Compose environment:

> **Note:** Docker Compose file-based secrets are only available in Compose file format version 3.1 and higher.

1. First, create a file for each secret you want to use. For example, to store your database URL and other credentials:

   ```bash
   echo "postgres://username:password@postgres:5432/hedgedoc" > dbURL.secret
   echo "your-session-secret" > sessionsecret.secret
   echo "your-s3-access-key" > s3_acccessKeyId.secret
   echo "your-s3-secret-key" > s3_secretAccessKey.secret
   ```

2. Update your `docker-compose.yml` file to use these secrets:

   ```yaml
   version: '3.8'

   services:
     hedgedoc:
       image: hedgedoc/hedgedoc:latest
       ports:
         - "3000:3000"
       secrets:
         - dbURL
         - sessionsecret
         - s3_acccessKeyId
         - s3_secretAccessKey
       environment:
         - CMD_DOMAIN=hedgedoc.example.com
         - CMD_IMAGE_UPLOAD_TYPE=s3
         - CMD_S3_BUCKET=hedgedoc-uploads
         - CMD_S3_REGION=us-east-1
         # Other environment variables as needed

     postgres:
       image: postgres:13
       environment:
         - POSTGRES_USER=username
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=hedgedoc
       volumes:
         - postgres-data:/var/lib/postgresql/data

   volumes:
     postgres-data:

   secrets:
     dbURL:
       file: ./dbURL.secret
     sessionsecret:
       file: ./sessionsecret.secret
     s3_acccessKeyId:
       file: ./s3_acccessKeyId.secret
     s3_secretAccessKey:
       file: ./s3_secretAccessKey.secret
   ```

## Using Docker Swarm Secrets

If you're using Docker Swarm, you can create secrets using the Docker CLI:

```bash
echo "postgres://username:password@postgres:5432/hedgedoc" | docker secret create dbURL -
echo "your-session-secret" | docker secret create sessionsecret -
echo "your-s3-access-key" | docker secret create s3_acccessKeyId -
echo "your-s3-secret-key" | docker secret create s3_secretAccessKey -
```

Then reference these secrets in your stack configuration:

```yaml
version: '3.8'

services:
  hedgedoc:
    image: hedgedoc/hedgedoc:latest
    ports:
      - "3000:3000"
    secrets:
      - dbURL
      - sessionsecret
      - s3_acccessKeyId
      - s3_secretAccessKey
    environment:
      - CMD_DOMAIN=hedgedoc.example.com
      - CMD_IMAGE_UPLOAD_TYPE=s3
      - CMD_S3_BUCKET=hedgedoc-uploads
      - CMD_S3_REGION=us-east-1
      # Other environment variables as needed

# ... rest of your stack configuration

secrets:
  dbURL:
    external: true
  sessionsecret:
    external: true
  s3_acccessKeyId:
    external: true
  s3_secretAccessKey:
    external: true
```

## How Docker Secrets Interact with Environment Variables

When both Docker secrets and environment variables are configured for the same setting, HedgeDoc prioritizes them in the following order:

1. Docker secrets take precedence if they exist
2. Environment variables are used as fallback if the corresponding secret is not found

This allows you to use a mix of both approaches, using secrets for sensitive information while still configuring non-sensitive settings through environment variables.

## Security Considerations

- Docker secrets are only accessible inside the container and are stored as files in the `/run/secrets/` directory.
- The content of these files is never logged or exposed through container inspection.
- For production deployments, consider using Docker Swarm's built-in secret management rather than file-based secrets in Docker Compose.
- Regularly rotate your secrets as part of your security practices.
- Docker secrets provide better security than environment variables, especially in production environments.

## Troubleshooting

If HedgeDoc isn't picking up your secrets:

1. Verify that the secrets are correctly mounted in the container by running:
   ```bash
   docker exec -it your-hedgedoc-container ls -la /run/secrets/
   ```

2. Check that the secret names match exactly what HedgeDoc expects (case-sensitive).

3. Ensure the secrets have the correct permissions and are readable by the HedgeDoc process.

4. Check the content of a secret file to verify it contains the expected value:
   ```bash
   docker exec -it your-hedgedoc-container cat /run/secrets/dbURL
   ```

5. If you're using Docker Compose, make sure your compose file version supports secrets (version 3.1 or higher).
