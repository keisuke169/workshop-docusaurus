---
sidebar_position: 5
---

# Deploy Redis no Cluster
Vamos implantar o redis em nosso cluster Kubernetes

```bash
kubectl create namespace redis
kubectl apply -n redis -f https://bit.ly/k8s-redis
```

### Resposta
```bash
deployment.apps/redis created
service/redis created
```

## Atualize o recurso KongPlugin
Assim que isso for implantado, vamos atualizar nossa configuração do Plugin do Kong para usar o Redis como um armazenamento de dados em vez de cada node do Kong armazenar as informações do contador na memória:

```bash
cat <<EOF | kubectl apply -f -
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
  policy: redis
  redis_host: redis.redis.svc.cluster.local
plugin: rate-limiting
EOF
```

### Resposta
```bash
kongplugin.configuration.konghq.com/global-rate-limit configured
```

Observe como a política agora está definida como `redis.redis.svc.cluster.local` e configuramos o Kong para se comunicar com o servidor redis disponível em `redis.redis.svc.cluster.local` Kubernetes Service FQDN. Este é o node Redis que você implantou anteriormente.

## Teste-o
Execute os comandos a seguir mais de 5 vezes.

O que acontece?

```bash
curl -I $DATA_PLANE_LB/foo-redis/headers -H 'apikey: my-sooper-secret-key'
```
### Resposta
```bash
HTTP/1.1 429 Too Many Requests
Date:
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Retry-After: 41
Content-Length: 37
X-RateLimit-Remaining-Minute: 0
X-RateLimit-Limit-Minute: 5
RateLimit-Remaining: 0
RateLimit-Limit: 5
RateLimit-Reset: 41
X-Kong-Response-Latency: 1
Server: kong/2.z
```

### Resultados
Como o Redis é o armazenamento de dados para o plugin de limitação de taxa, você deve ser capaz de fazer apenas 5 solicitações por minuto

## Conclusão
Você acabou de configurar o Redis como um armazenamento de dados para sincronizar informações em vários nós Kong para aplicar a política de limitação de acesso. Isso também pode ser usado para outros plugins que suportam Redis como um armazenamento de dados, como proxy-cache.