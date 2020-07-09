Kubernetes
===

To install use `helm install stable/hackmd`.

In your `values.yaml`, set this to use this repo instead of HackMD:
```yaml
image:
  repository: quay.io/codimd/server
  tag: 1.6.0
```
Replace the version with the [latest release listed here](https://github.com/codimd/server/tags)

Configuration values can be set using `extraVars`:
```yaml
extraVars:
  - name: CMD_DOMAIN
    value: pad.mydomain.com
  - name: CMD_PROTOCOL_USESSL
    value: "true"
  - name: CMD_URL_ADDPORT
    value: "false"
  - name: CMD_LOGLEVEL
    value: "info"
  ...
```

For any further details, please check out the offical CodiMD  [K8s helm chart](https://github.com/kubernetes/charts/tree/master/stable/hackmd).
