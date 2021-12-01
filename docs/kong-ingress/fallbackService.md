---
sidebar_position: 5
---

# Serviço de fallback
Neste laboratório de aprendizado, você aprenderá a configurar um serviço de fallback usando o recurso Ingress. O serviço substituto receberá todas as solicitações que não correspondam a nenhuma das regras de entrada definidas.
Isso pode ser útil para cenários em que você gostaria de retornar uma página 404 para o usuário final se o usuário clicar em um link inativo ou inserir um URL incorreto.

## Configure a regra do Ingress
Adicionar recurso de entrada para serviço do echo Adicione um recurso do Ingress que envia solicitações de proxy para e /cafe para o serviço do echo

```bash
echo '
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: demo-fallback
  annotations:
    konghq.com/strip-path: "true"
    kubernetes.io/ingress.class: kong
spec:
  rules:
  - http:
      paths:
      - path: /cafe
        backend:
          serviceName: echo
          servicePort: 80
' | kubectl apply -f -
```

### Resposta
```bash
ingress.extensions/demo created
```

## Verificação
Teste a regra do Ingress: 
```bash 
curl -i $DATA_PLANE_LB/cafe/status/200
```

### Resposta
```bash
HTTP/1.1 200 OK
Content-Type: text/plain; charset=UTF-8
Transfer-Encoding: chunked
Connection: keep-alive
Date: Tue, 19 Oct 2021 20:02:36 GMT
Server: echoserver
X-Kong-Upstream-Latency: 0
X-Kong-Proxy-Latency: 0
Via: kong/2.6.0.0-enterprise-edition



Hostname: echo-5fc5b5bc84-r47nz

Pod Information:
        node name:      ip-192-168-72-99.us-east-2.compute.internal
        pod name:       echo-5fc5b5bc84-r47nz
        pod namespace:  default
        pod IP: 192.168.84.208

Server values:
        server_version=nginx: 1.12.2 - lua: 10010

Request Information:
        client_address=192.168.71.216
        method=GET
        real path=/status/200
        query=
        request_version=1.1
        request_scheme=http
        request_uri=http://ae4164bb79dab4238859875597b65fd3-389728867.us-east-2.elb.amazonaws.com:8080/status/200

Request Headers:
        accept=*/*  
        connection=keep-alive  
        host=ae4164bb79dab4238859875597b65fd3-389728867.us-east-2.elb.amazonaws.com  
        user-agent=curl/7.76.1  
        x-forwarded-for=192.168.21.194  
        x-forwarded-host=ae4164bb79dab4238859875597b65fd3-389728867.us-east-2.elb.amazonaws.com  
        x-forwarded-path=/cafe/status/200  
        x-forwarded-port=80  
        x-forwarded-prefix=/cafe  
        x-forwarded-proto=http  
        x-real-ip=192.168.21.194  

Request Body:
        -no body in request-
```

## Crie um serviço de amostra de fallback.
Adicione um recurso KongPlugin para o serviço da fallback

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fallback-svc
spec:
  replicas: 1
  selector:
    matchLabels:
      app: fallback-svc
  template:
    metadata:
      labels:
        app: fallback-svc
    spec:
      containers:
      - name: fallback-svc
        image: hashicorp/http-echo
        args:
        - "-text"
        - "This is not the path you are looking for. - Fallback service"
        ports:
        - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: fallback-svc
  labels:
    app: fallback-svc
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 5678
    protocol: TCP
    name: http
  selector:
    app: fallback-svc
EOF
```

## Criando regra do Ingress
Configure a regra do Ingress para torná-lo o serviço substituto para enviar todas as solicitações que não correspondem a nenhuma de nossas regras de entrada:

```bash
echo '
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: fallback
  annotations:
    kubernetes.io/ingress.class: kong
spec:
  backend:
    serviceName: fallback-svc
    servicePort: 80
' | kubectl apply -f -
```

### Resposta
```bash
ingress.extensions/fallback created
```

## Verificar o serviço fallback
Agora, envie uma solicitação com uma propriedade de solicitação que não corresponda a nenhuma das regras definidas:
```bash
curl $DATA_PLANE_LB/random-path
```

### Resposta
```bash
This is not the path you are looking for. - Fallback service
```

## Conclusão
Como a solicitação não faz parte de nenhuma regra definida, o serviço substituto responde com `This is not the path you are looking for. - Fallback service`.