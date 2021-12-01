---
sidebar_position: 4
---

# Escalando o Kong no Kubernetes

Vamos primeiro garantir que o HPA esteja desligado

```bash
kubectl delete hpa kong-dp-kong -n kong-dp  
```

Agora, vamos expandir a implantação do controlador Kong Ingress para 3 pods, para capacidade de escalonamento e redundância:

```bash
kubectl scale deployment/kong-dp-kong -n kong-dp --replicas=3
```

### Resposta

```bash
deployment.extensions/ingress-kong scaled
```


## Aguarde a implantação das réplicas

Levará alguns minutos para que os novos pods sejam inicializados. Execute o seguinte comando para mostrar que as réplicas estão prontas.

```bash
kubectl get pods -n kong-dp
```

```bash
NAME                              READY   STATUS    RESTARTS   AGE    IP               NODE                             NOMINATED NODE   READINESS GATES
kong-dp-kong-6649b7fccc-bxrqd     1/1     Running   0          118s   192.168.7.94     ip-192-168-12-141.ec2.internal   <none>           <none>
kong-dp-kong-6649b7fccc-v7fss     1/1     Running   0          118s   192.168.50.97    ip-192-168-47-143.ec2.internal   <none>           <none>
kong-dp-kong-6649b7fccc-xx22r     1/1     Running   0          137m   192.168.20.105   ip-192-168-12-141.ec2.internal   <none>           <none>
```

## Verifique o controle de tráfego

Teste a política de limitação de taxa executando o seguinte comando e observando os cabeçalhos de limite de acesso.

```bash
curl -I $DATA_PLANE_LB/foo-redis/headers
```

### Resposta

```bash
HTTP/1.1 200 OK
Content-Type: text/plain; charset=UTF-8
Connection: keep-alive
Server: echoserver
X-RateLimit-Limit-minute: 5
X-RateLimit-Remaining-minute: 4
demo:  injected-by-kong
X-Kong-Upstream-Latency: 1
X-Kong-Proxy-Latency: 2
Via: kong/2.x
```

## Resultados

Você observará que o limite de acesso não é mais consistente e você pode fazer mais de 5 solicitações por minuto.

Para entender esse comportamento, precisamos entender como configuramos o Kong. Na política atual, cada node do Kong está rastreando um limite de taxa na memória e permitirá que 5 solicitações sejam enviadas para um cliente. Não há sincronização das informações de limite de taxa nos nós Kong. Em casos de uso em que a limitação de acesso é usada como um mecanismo de proteção e para evitar sobrecarregar seus serviços, cada node Kong rastreando seu próprio contador de solicitações é bom o suficiente, pois um usuário mal-intencionado atingirá os limites de taxa em todos os nodes eventualmente. Ou se o balanceamento de carga na frente do Kong está realizando algum tipo de hash determinístico de solicitações de modo que o mesmo node do Kong sempre receba as solicitações de um cliente, então não teremos esse problema.

## Proxímos passos ?

Em alguns casos, é necessária uma sincronização de informações que cada node Kong mantém na memória. Para isso, o Redis pode ser usado. Vamos prosseguir e configurar isso a seguir.