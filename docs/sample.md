---
sidebar_position: 4
---

# Sample App

Comece instalando duas aplicações echo e httpbin. Ambos consistem em um Deployment e um Service do Kubernetes.

## Deploy do service echo
```bash
kubectl apply -f https://bit.ly/sample-echo-service
```

### Resposta
```bash
service/echo created
deployment.apps/echo created
```

## Deploy do service httpbin
```bash
kubectl apply -f https://bit.ly/sample-httpbin-service
```

### Resposta
```bash
service/httpbin created
deployment.apps/httpbin created
service/httpbin-2 created
deployment.apps/httpbin-2 created
```

## Verificação

Verifique se as implantações echo, httpbin e httpbin-2 foram totalmente implementadas.
```bash
kubectl get deployment --namespace=default
```

### Resposta
```bash
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
echo       2/2     2            2           52s
httpbin    1/1     1            1           33s
httpbin-2  1/1     1            1           33s
```

A coluna READY exibe dois números o primeiro para quantos pods de uma implantação estão prontos e segundo para quantos são desejados no /format. Aguarde até que todos os pods desejados estejam prontos antes de prosseguir para a próxima etapa.