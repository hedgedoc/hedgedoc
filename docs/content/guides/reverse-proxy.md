# How to use a reverse proxy

<!-- markdownlint-disable proper-names -->

When having multiple webservers or other applications running, that also use
port 80 and 443, you probably want to use a reverse proxy to serve HedgeDoc.

We'll assume the domain you use for the instance is <https://md.example.com>, so please
substitute your actual domain anywhere you encounter <https://md.example.com>.

## Configuring the reverse proxy

We have collected some example configurations for popular reverse proxies below.
At the end is also a list of generic things the reverse proxy must do, if you prefer
to write your own config or use a reverse proxy not mentioned here.

### Traefik

As [traefik][traefik] has direct access to your running Docker containers, there is no need to
configure extra ports. Instead, you'll only have to add the following labels to the services
in your `docker-compose.yml`:

<!-- markdownlint-disable line-length no-space-in-code -->

??? abstract "docker-compose.yml"
    ```yaml
    backend:
      image: ghcr.io/hedgedoc/hedgedoc/backend:2.0.0-alpha.3
      volumes:
        - $PWD/.env:/usr/src/app/backend/.env
        - hedgedoc_uploads:/usr/src/app/backend/uploads
      labels:
        traefik.enable: "true"
        traefik.http.routers.hedgedoc_2_backend.rule: "Host(`md.example.com`) && (PathPrefix(`/realtime`) || PathPrefix(`/api`) || PathPrefix(`/public`) || PathPrefix(`/uploads`) || PathPrefix(`/media`))"
        traefik.http.routers.hedgedoc_2_backend.tls: "true"
        traefik.http.routers.hedgedoc_2_backend.tls.certresolver: "letsencrypt"
        traefik.http.services.hedgedoc_2_backend.loadbalancer.server.port: "3000"
        traefik.http.services.hedgedoc_2_backend.loadbalancer.server.scheme: "http"
    frontend:
      image: ghcr.io/hedgedoc/hedgedoc/frontend:2.0.0-alpha.3
      environment:
        HD_BASE_URL: "${HD_BASE_URL}"
      labels:
        traefik.enable: "true"
        traefik.http.routers.hedgedoc_2_frontend.rule: "Host(`md.example.com`)"
        traefik.http.routers.hedgedoc_2_frontend.tls: "true"
        traefik.http.routers.hedgedoc_2_frontend.tls.certresolver: "letsencrypt"
        traefik.http.services.hedgedoc_2_frontend.loadbalancer.server.port: "3001"
        traefik.http.services.hedgedoc_2_frontend.loadbalancer.server.scheme: "http"
    ```

<!-- markdownlint-enable line-length no-space-in-code -->

We added [Let's Encrypt][letsencrypt] as a certificate resolver, as it enables you to
quickly use HTTPS. If you don't want to use that feel free to change
the `.certresolver` variables accordingly.

If you used the `docker-compose.yml` file from the tutorial, please remove
the service `proxy` and the volume `caddy_data` as caddy is no longer needed when using traefik.

### Other reverse proxies

In the following we'll also assume that you run a HedgeDoc backend on port `3000`,
a HedgeDoc frontend on port `3001`.  
Furthermore, we assume that you have TLS certificates located at
`/etc/letsencrypt/live/md.example.com/fullchain.pem`
and
`/etc/letsencrypt/live/md.example.com/privkey.pem` respectively
and are using [Let's Encrypt][letsencrypt] for your certificates.
Replace these paths with the actual paths to your certificates.

**Preparations when using the default docker-compose.yml:**

If your starting with the `docker-compose.yml` file from the tutorial,
you need to add the `ports` entry for both `backend` and `frontend` as following.

<!-- markdownlint-disable no-space-in-code -->

??? abstract "docker-compose.yml"
    ```yaml
    backend:
      image: ghcr.io/hedgedoc/hedgedoc/backend:2.0.0-alpha.3
      volumes:
        - $PWD/.env:/usr/src/app/backend/.env
        - hedgedoc_uploads:/usr/src/app/backend/uploads
      ports:
        - "3000:3000"
    frontend:
      image: ghcr.io/hedgedoc/hedgedoc/frontend:2.0.0-alpha.3
      environment:
        HD_BASE_URL: "${HD_BASE_URL}"
      ports:
        - "3001:3001"
    ```

<!-- markdownlint-enable no-space-in-code -->

Also, you want to remove the service `proxy` and the volume `caddy_data`
to avoid port conflicts with your reverse-proxy software.

#### nginx

Here is an example configuration for [nginx][nginx].

<!-- markdownlint-disable code-block-style -->

??? abstract "nginx config"
    ```
    map $http_upgrade $connection_upgrade {
            default upgrade;
            ''      close;
    }
    server {
            server_name md.example.com;

            location ~ ^/(api|public|uploads|media)/ {
                    proxy_pass http://127.0.0.1:3000;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
            }

            location /realtime {
                    proxy_pass http://127.0.0.1:3000;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection $connection_upgrade;
            }
    
            location / {
                    proxy_pass http://127.0.0.1:3001;
                    proxy_set_header X-Forwarded-Host $host; 
                    proxy_set_header X-Real-IP $remote_addr; 
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
                    proxy_set_header X-Forwarded-Proto $scheme;
            }
    
        listen [::]:443 ssl http2;
        listen 443 ssl http2;
        ssl_certificate fullchain.pem;
        ssl_certificate_key privkey.pem;
        include options-ssl-nginx.conf;
        ssl_dhparam ssl-dhparams.pem;
    }
    ```

<!-- markdownlint-disable code-block-style -->

#### Apache

You will need these modules enabled: `proxy`, `proxy_http` and `proxy_wstunnel`.  
Here is an example config snippet for [Apache][apache]:

<!-- markdownlint-disable code-block-style -->

??? abstract "Apache config"
    ```
    <VirtualHost *:443>
      ServerName md.example.com

      RewriteEngine on
      RewriteCond %{REQUEST_URI} ^/realtime             [NC]
      RewriteCond %{HTTP:Upgrade} =websocket             [NC]
      RewriteRule /(.*)  ws://127.0.0.1:3000/$1          [P,L]
    
      ProxyPass /api http://127.0.0.1:3000/
      ProxyPass /public http://127.0.0.1:3000/
      ProxyPass /realtime http://127.0.0.1:3000/
      
      ProxyPassReverse /api http://127.0.0.1:3000/
      ProxyPassReverse /public http://127.0.0.1:3000/
      ProxyPassReverse /uploads http://127.0.0.1:3000/
      ProxyPassReverse /media http://127.0.0.1:3000/
      ProxyPassReverse /realtime http://127.0.0.1:3000/
      
      ProxyPass / http://127.0.0.1:3001/
      ProxyPassReverse / http://127.0.0.1:3001/
    
      RequestHeader set "X-Forwarded-Proto" expr=%{REQUEST_SCHEME}
            
      ErrorLog ${APACHE_LOG_DIR}/error.log
      CustomLog ${APACHE_LOG_DIR}/access.log combined
    
      SSLCertificateFile /etc/letsencrypt/live/md.example.com/fullchain.pem
      SSLCertificateKeyFile /etc/letsencrypt/live/md.example.com/privkey.pem
      Include /etc/letsencrypt/options-ssl-apache.conf
    </VirtualHost>
    ```

<!-- markdownlint-enable code-block-style -->

#### Generic

Here is a list of things your reverse proxy needs to do to let HedgeDoc work:

- Websocket `Upgrade` requests at path `/realtime`.
- Passing `/realtime` to <http://localhost:3000>
- Passing `/api/*` to <http://localhost:3000>
- Passing `/public/*` to <http://localhost:3000>
- Passing `/uploads/*` to <http://localhost:3000>
- Passing `/media/*` to <http://localhost:3000>
- Passing `/*` to <http://localhost:3001>
- Set the `X-Forwarded-Proto` header 

In essence there are a few special urls that need to be handled by the HedgeDoc backend
and everything else is handled by the frontend.

<!-- markdownlint-enable proper-names -->

[traefik]: https://traefik.io/traefik/
[letsencrypt]: https://letsencrypt.org/
[nginx]: https://nginx.org/
[apache]: https://httpd.apache.org/
