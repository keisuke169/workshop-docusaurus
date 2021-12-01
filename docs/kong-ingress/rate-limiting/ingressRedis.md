---
sidebar_position: 3
---

# Criando Regra
Vamos adicionar uma regra de entrada que envia solicitações de proxy para /redis ao serviço httpbin

```bash
echo '
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: demo-redis
  annotations:
    konghq.com/strip-path: "true"
    kubernetes.io/ingress.class: kong
spec:
  rules:
  - http:
      paths:
      - path: /foo-redis
        backend:
          serviceName: httpbin
          servicePort: 80
' | kubectl apply -f -
```

### Resposta
```bash
ingress.extensions/demo-redis created
```
## Verificar regra de entrada
Teste o acesso ao serviço httpbin

```bash
curl -I $DATA_PLANE_LB/foo-redis/status/200 -H 'apikey: my-sooper-secret-key'
```

### Resposta
```bash
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 0
Connection: keep-alive
Server: gunicorn/19.9.0
Date: 
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Kong-Upstream-Latency: 2
X-Kong-Proxy-Latency: 1
Via: kong/2.x
```