---
sidebar_position: 2
---

# Criando Prometheus e Grafana
Usaremos o Operador Prometheus para monitoramento Kubernetes e monitoramento Kong Data Plane.

Para oferecer suporte ao HPA da perspectiva de observabilidade, vamos configurar o Service Monitor para monitorar o número variável de réplicas de pods.

## Operador Prometheus
Em primeiro lugar, vamos instalar o Prometheus Operator com seus gráficos de leme específicos. Observe que estamos solicitando balanceadores de carga para expor as interfaces de usuário do Prometheus, Grafana e Alert Manager.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

```bash
kubectl create namespace prometheus
```

```bash
helm install prometheus -n prometheus prometheus-community/kube-prometheus-stack \
--set alertmanager.enabled=false \
--set grafana.service.type=LoadBalancer
```

Use agora deve ver vários novos pods e serviços após as instalações

```bash
kubectl get service -n prometheus
```

### Saída Esperada
```bash
NAME                                      TYPE           CLUSTER-IP       EXTERNAL-IP                                                                 PORT(S)                      AGE
alertmanager-operated                     ClusterIP      None             &lt;none&gt;                                                                      9093/TCP,9094/TCP,9094/UDP   26m
prometheus-grafana                        LoadBalancer   10.100.204.248   ae1ec0bd5f24349d29915b384b0e357f-301715715.eu-central-1.elb.amazonaws.com   80:31331/TCP                 27m
prometheus-kube-prometheus-alertmanager   LoadBalancer   10.100.98.34     a8bc14bcf3eb34ce4bd6b1607be191f8-225304004.eu-central-1.elb.amazonaws.com   9093:31094/TCP               27m
prometheus-kube-prometheus-operator       ClusterIP      10.100.0.147     &lt;none&gt;                                                                      443/TCP                      27m
prometheus-kube-prometheus-prometheus     LoadBalancer   10.100.160.161   a49dce814ab2f40f3b34ae942e02bf4b-931182925.eu-central-1.elb.amazonaws.com   9090:30701/TCP               27m
prometheus-kube-state-metrics             ClusterIP      10.100.23.71     &lt;none&gt;                                                                      8080/TCP                     27m
prometheus-operated                       ClusterIP      None             &lt;none&gt;                                                                      9090/TCP                     26m
prometheus-prometheus-node-exporter       ClusterIP      10.100.130.95    &lt;none&gt;                                                                      9100/TCP                     27m
```

```bash
kubectl get pod -n prometheus
```

### Saída Esperada
```bash
NAME                                                     READY   STATUS    RESTARTS   AGE
alertmanager-prometheus-kube-prometheus-alertmanager-0   2/2     Running   0          27m
prometheus-grafana-7ff95c75bd-vkkzp                      2/2     Running   0          27m
prometheus-kube-prometheus-operator-59c5dcf5bc-vwbpp     1/1     Running   0          27m
prometheus-kube-state-metrics-84dfc44b69-nl5n9           1/1     Running   0          27m
prometheus-prometheus-kube-prometheus-prometheus-0       2/2     Running   1          27m
prometheus-prometheus-node-exporter-jtzts                1/1     Running   0          27m
```

## Verifica Grafana
Exporte o load balance o para Grafana
```bash
echo "export GRAFANA_LB=$(kubectl get service prometheus-grafana -n prometheus \-\-output=jsonpath='{.status.loadBalancer.ingress[0].hostname}')" >> ~/.bashrc
bash
```

```bash
echo $GRAFANA_LB
```

Copie o resultado e abra no seu navegador

Digite o nome de usuário como administrador e obtenha a senha de administrador do Grafana a partir do seguinte comando

```bash
kubectl get secret prometheus-grafana -n prometheus -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

![Grafana](../../../images/grafana.png)