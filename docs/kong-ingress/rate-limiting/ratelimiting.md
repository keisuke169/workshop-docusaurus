---
sidebar_position: 2
---

# Adicionar plugin de limitação de taxa

Adicione o plugin de limitação de acesso com uma política de limitação de acesso global:

```bash
echo '
apiVersion: configuration.konghq.com/v1
kind: KongClusterPlugin
metadata:
  name: global-rate-limit
  annotations:
    kubernetes.io/ingress.class: kong
  labels:
    global: "true"
config:
  minute: 5
  policy: local
plugin: rate-limiting
' | kubectl apply -f -
```

### Resposta

```bash
kongplugin.configuration.konghq.com/global-rate-limit created
```

## Resultados

Aqui, você configura o Kong para limitar a taxa de tráfego de qualquer cliente para 5 solicitações por minuto, aplicando esta política em um sentido global. Isso significa que o limite de acesso se aplica a todos os serviços.

:::note Nota
Você pode configurar isso para um Ingress específico ou um serviço específico também. Siga o guia de recursos do KongPlugin nas etapas para fazer isso.
:::

## Verifique o controle de tráfego

Em seguida, teste a política de limitação de acesso executando o seguinte comando várias vezes e observe os cabeçalhos de limite de taxa na resposta, especialmente, X-RateLimit-Remaining-Minute, RateLimit-Reset e Retry-After:

```bash
curl -I $DATA_PLANE_LB/foo-redis/headers -H 'apikey: my-sooper-secret-key'
```
### Resposta

```bash
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 384
Connection: keep-alive
RateLimit-Limit: 5
RateLimit-Remaining: 0
X-RateLimit-Remaining-Minute: 0
RateLimit-Reset: 53
X-RateLimit-Limit-Minute: 5
Server: gunicorn/19.9.0
Date: Tue, 19 Oct 2021 19:51:07 GMT
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Kong-Upstream-Latency: 1
X-Kong-Proxy-Latency: 1
Via: kong/2.6.0.0-enterprise-edition
```

Depois de enviar muitas solicitações, quando o limite de taxa for atingido, você verá `HTTP/1.1 429 Too Many Requests`

```bash
HTTP/1.1 429 Too Many Requests
Date: Tue, 19 Oct 2021 19:51:37 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
RateLimit-Limit: 5
RateLimit-Remaining: 0
X-RateLimit-Remaining-Minute: 0
RateLimit-Reset: 23
X-RateLimit-Limit-Minute: 5
Retry-After: 23
Content-Length: 41
X-Kong-Response-Latency: 1
Server: kong/2.6.0.0-enterprise-edition
```

## Resultados

Como há uma única instância do Kong em execução, o Kong impõe corretamente o limite de acesso e você pode fazer apenas 5 solicitações por minuto.