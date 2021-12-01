---
sidebar_position: 4
---

# Data Plane Elasticity
Um dos recursos mais importantes fornecidos pelo Kubernetes é escalonar facilmente uma implantação. Com um único comando, podemos criar ou encerrar réplicas de pods para oferecer suporte otimizado a uma determinada taxa de transferência.

Esse recurso é especialmente interessante para aplicativos Kubernetes como Kong para Kubernetes Ingress Controller.

Esta é a nossa implantação antes de escaloná-la:

```bash
kubectl get service -n kong-dp
```

### Resposta
```bash
NAME                 TYPE           CLUSTER-IP     EXTERNAL-IP                                                                  PORT(S)                      AGE
kong-dp-kong-proxy   LoadBalancer   10.100.12.30   a6bf3f71a14a64dba850480616af8fc9-1188819016.eu-central-1.elb.amazonaws.com   80:32336/TCP,443:31316/TCP   7m25s
```

Observe, neste ponto do workshop, há apenas um pod captando o tráfego do Data-Plane.

```bash
kubectl get pod -n kong-dp -o wide
```

### Resposta
```bash
NAME                            READY   STATUS    RESTARTS   AGE   IP               NODE                                              NOMINATED NODE   READINESS GATES
kong-dp-kong-75478bfcff-sq8f6   1/1     Running   0          12m   192.168.16.247   ip-192-168-29-188.eu-central-1.compute.internal   <none>           <none>
```

## Escalonamento manual
Agora, vamos dimensionar a implantação criando 3 réplicas do pod

```bash
kubectl scale deployment.v1.apps/kong-dp-kong -n kong-dp --replicas=3
```

Verifique a implantação novamente e agora você deve ver 3 réplicas do pod.

```bash
kubectl get pod -n kong-dp -o wide
```

### Resposta
```bash
NAME                            READY   STATUS    RESTARTS   AGE   IP               NODE                                              NOMINATED NODE   READINESS GATES
kong-dp-kong-75478bfcff-5n2dx   1/1     Running   0          18s   192.168.22.59    ip-192-168-29-188.eu-central-1.compute.internal   <none>           <none>
kong-dp-kong-75478bfcff-b5plv   1/1     Running   0          18s   192.168.25.162   ip-192-168-29-188.eu-central-1.compute.internal   <none>           <none>
kong-dp-kong-75478bfcff-sq8f6   1/1     Running   0          13m   192.168.16.247   ip-192-168-29-188.eu-central-1.compute.internal   <none>           <none>
```

Como podemos ver, os 2 novos pods foram criados e estão funcionando. Se verificarmos nosso serviço Kubernetes novamente, veremos que ele foi atualizado com os novos endereços IP. Isso permite que o serviço implemente o balanceamento de carga nas réplicas do pod.

```bash
kubectl describe service kong-dp-kong-proxy -n kong-dp
```

### Resposta
```bash
Name:                     kong-dp-kong-proxy
Namespace:                kong-dp
Labels:                   app.kubernetes.io/instance=kong-dp
                          app.kubernetes.io/managed-by=Helm
                          app.kubernetes.io/name=kong
                          app.kubernetes.io/version=2.4
                          enable-metrics=true
                          helm.sh/chart=kong-2.2.0
Annotations:              meta.helm.sh/release-name: kong-dp
                          meta.helm.sh/release-namespace: kong-dp
Selector:                 app.kubernetes.io/component=app,app.kubernetes.io/instance=kong-dp,app.kubernetes.io/name=kong
Type:                     LoadBalancer
IP Families:              <none>
IP:                       10.100.12.30
IPs:                      10.100.12.30
LoadBalancer Ingress:     a6bf3f71a14a64dba850480616af8fc9-1188819016.eu-central-1.elb.amazonaws.com
Port:                     kong-proxy  80/TCP
TargetPort:               8000/TCP
NodePort:                 kong-proxy  32336/TCP
Endpoints:                192.168.16.247:8000,192.168.22.59:8000,192.168.25.162:8000
Port:                     kong-proxy-tls  443/TCP
TargetPort:               8443/TCP
NodePort:                 kong-proxy-tls  31316/TCP
Endpoints:                192.168.16.247:8443,192.168.22.59:8443,192.168.25.162:8443
Session Affinity:         None
External Traffic Policy:  Cluster
Events:
  Type    Reason                Age   From                Message
  ----    ------                ----  ----                -------
  Normal  EnsuringLoadBalancer  14m   service-controller  Ensuring load balancer
  Normal  EnsuredLoadBalancer   14m   service-controller  Ensured load balancer
```

Reduza o número de pods para 1 novamente em execução, pois agora vamos ativar o escalonamento automático de pods horizontal.

```bash
kubectl scale deployment.v1.apps/kong-dp-kong -n kong-dp --replicas=1
```

## HPA - autoescalador horizontal
HPA (“Horizontal Pod Autoscaler”) é o recurso Kubernetes para controlar automaticamente o número de réplicas de pods. Com o HPA, o Kubernetes é capaz de dar suporte às solicitações produzidas pelos consumidores, mantendo um determinado Nível de Serviço.

Com base na utilização da CPU ou métricas personalizadas, o HPA inicia e encerra as réplicas de pods, atualizando todos os dados de serviço para ajudar nas políticas de balanceamento de carga sobre essas réplicas.

HPA é descrito [aqui](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/). Além disso, há um bom passo a passo em https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/

O Kubernetes define suas próprias unidades para CPU e memória. Você pode ler mais sobre isso [aqui](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/). Usamos essas unidades para definir nossas implantações com HPA.

## Instalar Metrics Server
A instalação do servidor de métricas é necessária para o funcionamento do HPA. Instale o servidor de métricas da seguinte forma

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

E teste-o da seguinte maneira

```bash
kubectl get pod -n kube-system
```

Agora você deve ver um novo pod metrics-server- no estado Running

### Resposta
```bash
NAME                             READY   STATUS    RESTARTS   AGE
aws-node-kjz2s                   1/1     Running   0          18h
coredns-85cc4f6d5-868x9          1/1     Running   0          18h
coredns-85cc4f6d5-jjcjq          1/1     Running   0          18h
kube-proxy-6gwdp                 1/1     Running   0          18h
metrics-server-9f459d97b-kxzg2   1/1     Running   0          38s
```

## Ative o HPA
Ainda usando o Helm, vamos atualizar nossa implantação do data-plane, incluindo configurações novas e específicas para HPA:

```bash
helm upgrade kong-dp kong/kong -n kong-dp \
--set ingressController.enabled=false \
--set image.repository=kong/kong-gateway \
--set image.tag=2.6.0.0-alpine \
--set env.database=off \
--set env.role=data_plane \
--set env.cluster_cert=/etc/secrets/kong-cluster-cert/tls.crt \
--set env.cluster_cert_key=/etc/secrets/kong-cluster-cert/tls.key \
--set env.lua_ssl_trusted_certificate=/etc/secrets/kong-cluster-cert/tls.crt \
--set env.cluster_control_plane=kong-kong-cluster.kong.svc.cluster.local:8005 \
--set env.cluster_telemetry_endpoint=kong-kong-clustertelemetry.kong.svc.cluster.local:8006 \
--set proxy.enabled=true \
--set proxy.type=LoadBalancer \
--set enterprise.enabled=true \
--set enterprise.license_secret=kong-enterprise-license \
--set enterprise.portal.enabled=false \
--set enterprise.rbac.enabled=false \
--set enterprise.smtp.enabled=false \
--set manager.enabled=false \
--set portal.enabled=false \
--set portalapi.enabled=false \
--set env.status_listen=0.0.0.0:8100 \
--set secretVolumes[0]=kong-cluster-cert \
--set resources.requests.cpu="300m" \
--set resources.requests.memory="300Mi" \
--set resources.limits.cpu="1200m" \
--set resources.limits.memory="800Mi" \
--set autoscaling.enabled=true \
--set autoscaling.minReplicas=1 \
--set autoscaling.maxReplicas=5 \
--set autoscaling.metrics[0].type=Resource \
--set autoscaling.metrics[0].resource.name=cpu \
--set autoscaling.metrics[0].resource.target.type=Utilization \
--set autoscaling.metrics[0].resource.target.averageUtilization=15
```

## Checking HPA
Depois de enviar o comando, verifique a implantação novamente. Como não consumimos o data-plane, devemos ver um único pod em execução. Nas próximas seções, enviaremos solicitações ao Data-Plane e um novo pod será criado para lidar com elas.

```bash
kubectl get pod -n kong-dp
```

### Resposta
```bash
NAME                            READY   STATUS    RESTARTS   AGE
kong-dp-kong-67c5c7d4c5-n2cv6   1/1     Running   0          59s
```

Você pode verificar o status do HPA com:

```bash
kubectl get hpa -n kong-dp
```

### Resposta

```bash
NAME           REFERENCE                 TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
kong-dp-kong   Deployment/kong-dp-kong   0%/75%    1         20        1          80s
```

Deixe o HPA definido para que possamos vê-lo em ação ao enviar solicitações ao Data-Plane.