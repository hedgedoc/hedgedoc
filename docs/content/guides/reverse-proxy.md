# Using a Reverse Proxy with HedgeDoc

If you want to use a reverse proxy to serve HedgeDoc, here are the essential
configs that you'll have to do.

This documentation will cover HTTPS setup, with comments for HTTP setup.

## Cloudflare
!!! warning
    If you use Cloudflare as reverse proxy, then you **MUST** disable Rocket Loader, or your HedgeDoc instance may be broken.
    For more information please read the [Cloudflare documentation](https://developers.cloudflare.com/speed/optimization/content/rocket-loader).

## HedgeDoc config

### Useful configuration options

| `config.json` parameter | Environment variable | Value | Example |
|-------------------------|----------------------|-------|---------|
| `domain` | `CMD_DOMAIN` | The full domain where your instance will be available | `hedgedoc.example.com` |
| `host` | `CMD_HOST` | An ip or domain name that is only available to HedgeDoc and your reverse proxy | `localhost` |
| `port` | `CMD_PORT` | An available port number on that IP | `3000` |
| `path` | `CMD_PATH` | path to UNIX domain socket to listen on (if specified, `host` or `CMD_HOST` and `port` or `CMD_PORT` are ignored) | `/var/run/hedgedoc.sock` |
| `protocolUseSSL` | `CMD_PROTOCOL_USESSL` | `true` if you want to serve your instance over SSL (HTTPS), `false` if you want to use plain HTTP | `true` |
| `useSSL` |  | `false`, the communications between HedgeDoc and the proxy are unencrypted | `false` |
| `urlAddPort` | `CMD_URL_ADDPORT` | `false`, HedgeDoc should not append its port to the URLs it links | `false` |
| `hsts.enable` | `CMD_HSTS_ENABLE` | `true` if you host over SSL, `false` otherwise | `true` |

[Full explanation of the configuration options](../configuration.md)

### Configure asset link generation

HedgeDoc generates links to other pages and to assets (like images, stylesheets, fonts, etc) using the following settings. You must configure them according to the URL that you use to access your instance.

- `domain` (env: `CMD_DOMAIN`)
- `protocolUseSSL` (env: `CMD_PROTOCOL_USESSL`)
- `urlAddPort` (env: `CMD_URL_ADDPORT`)

!!! example
    You access your HedgeDoc instance using a reverse proxy via `https://markdown.example`. You must set:

    - `domain` to `markdown.example`.
    - `protocolUseSSL` to `true` because you access your instance via HTTPS.
    - `urlAddPort` to `false` because you access the instance using the default HTTPS port.


## Reverse Proxy config

### Generic

The reverse proxy must allow websocket `Upgrade` requests at path `/sockets.io/`.

It must pass through the scheme used by the client (http or https).

### Nginx

Here is an example configuration for Nginx.

```
map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
}
server {
        server_name hedgedoc.example.com;

        location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_set_header Host $host; 
                proxy_set_header X-Real-IP $remote_addr; 
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
                proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /socket.io/ {
                proxy_pass http://127.0.0.1:3000;
                proxy_set_header Host $host; 
                proxy_set_header X-Real-IP $remote_addr; 
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; 
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection $connection_upgrade;
        }

    listen [::]:443 ssl;
    listen 443 ssl;
    http2 on;
    ssl_certificate fullchain.pem;
    ssl_certificate_key privkey.pem;
    include options-ssl-nginx.conf;
    ssl_dhparam ssl-dhparams.pem;
}
```

!!! warning

    NGINX `proxy_pass` directives must NOT have trailing slashes. If the trailing
    slashes are present, the browser will not be able to establish a WebSocket
    connection to the server, and the editor interface will display an endless loading
    animation.



!!! warning

    Starting with NGINX Version [1.25.1](https://nginx.org/en/CHANGES) (released on 13
    Jun 2023) the `http2`-**parameter** for the `listen`-directive has been deprecated!

    NGINX Version 1.25.1 introduces [`http2` as a standalone directive](https://nginx.org/en/docs/http/ngx_http_v2_module.html)
    which can be enabled as can be seen in the example above.

    If you are running on an older NGINX version you can delete the `http2 on;`-line and
    add the `http2`-parameter to both `listen`-directive lines.

    ```
    listen [::]:443 ssl http2;
    listen 443 ssl http2;
    ```

!!! information

    If you do not want to expose the `/metrics` and `/status` HTTP-endpoints to the whole
    internet but you need to (for example) monitor `/metrics` using your Prometheus
    installation (so disabling `enableStatsApi` in the HedgeDoc config is not a viable
    option) you can add the following location blocks to your NGINX-server-block to limit
    access to trusted (monitoring) networks / ip-literals.

    ```
    location /metrics {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        allow 2001:db8::/64;
        allow 192.0.2.0/24;
        [...]
        deny all;
    }

    location /status {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        allow 2001:db8::/64;
        allow 192.0.2.0/24;
        [...]
        deny all;
    }
    ```

    While it is certainly not a security issue itself to keep these public to the internet
    it could give attackers additional information and help them exploit your HedgeDoc installation.

    Therefore if you do not have a monitoring setup (like Prometheus) it's likely you do not
    need to expose this information at all and can simply set `enableStatsApi` to false (default
    is true) in your HedgeDoc `config.json`.


### Apache
You will need these modules enabled: `proxy`, `proxy_http` and `proxy_wstunnel`.  
Here is an example config snippet:
```
<VirtualHost *:443>
  ServerName hedgedoc.example.com

  RewriteEngine on
  RewriteCond %{REQUEST_URI} ^/socket.io             [NC]
  RewriteCond %{HTTP:Upgrade} =websocket             [NC]
  RewriteRule /(.*)  ws://127.0.0.1:3000/$1          [P,L]

  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/

  RequestHeader set "X-Forwarded-Proto" expr=%{REQUEST_SCHEME}
        
  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined

  SSLCertificateFile /etc/letsencrypt/live/hedgedoc.example.com/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/hedgedoc.example.com/privkey.pem
  Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
```
