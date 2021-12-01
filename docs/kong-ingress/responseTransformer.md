---
sidebar_position: 2
---

# Response-Transformer plugin

## Introdução

O plugin Response-Transformer modifica a resposta upstream (por exemplo, resposta do servidor) antes de retorná-la ao cliente.

Nesta seção, você configurará o plugin Response-Transformer no recurso de entrada. Especificamente, você configurará o Kong para modificar o cabeçalho do echo-server para incluir “demo: injected-by-kong” antes de responder ao cliente.

## Criar recurso KongPlugin

Crie um recurso KongPlugin configurando o Kong para Kubernetes para executar o plug-in Response-Transformer sempre que uma solicitação correspondente à regra de entrada for processada.


```bash
echo '
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: add-response-header
config:
  add:
    headers:
    - "demo: injected-by-kong"
plugin: response-transformer
' | kubectl apply -f -
```

### Resposta
```bash
kongplugin.configuration.konghq.com/add-response-header created
```

## Associar o plugin à regra de entrada

Associe o plug-in Response-Transformer à regra de ingresso que você criou anteriormente.

```bash
kubectl patch ingress demo -p '{"metadata":{"annotations":{"konghq.com/plugins":"add-response-header"}}}'
```

## Verificar

Teste para certificar-se de que Kong transforma a solicitação no servidor de eco e no servidor httpbin.

### Requisição 1

```bash
curl -I $DATA_PLANE_LB/bar
```

### Resposta
```bash
HTTP/1.1 200 OK
Content-Type: text/plain; charset=UTF-8
Connection: keep-alive
Date: Tue, 19 Oct 2021 19:41:18 GMT
Server: echoserver
demo:  injected-by-kong
X-Kong-Upstream-Latency: 0
X-Kong-Proxy-Latency: 0
Via: kong/2.6.0.0-enterprise-edition
```
### Requisição 2

```bash
curl -i $DATA_PLANE_LB/foo/status/200
```

### Resposta
```bash
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 0
Connection: keep-alive
Server: gunicorn/19.9.0
Date: Tue, 19 Oct 2021 19:41:54 GMT
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
demo:  injected-by-kong
X-Kong-Upstream-Latency: 2
X-Kong-Proxy-Latency: 0
Via: kong/2.6.0.0-enterprise-edition
```

### Resultados

Observe na resposta “demo: injected-by-kong” em injetado no cabeçalho. Kong modifica a resposta com o plug-in Response-Transformer quando as solicitações correspondem à regra de ingresso definida no recurso de ingresso de demonstração.

## O que acontece se você enviar uma solicitação para /baz?

Envie uma solicitação para /baz.

### Requisição 1

```bash
curl -I $DATA_PLANE_LB/baz
```

### Resposta
```bash
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 9593
Connection: keep-alive
Server: gunicorn/19.9.0
Date: Tue, 19 Oct 2021 19:42:26 GMT
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Kong-Upstream-Latency: 3
X-Kong-Proxy-Latency: 0
Via: kong/2.6.0.0-enterprise-edition
```

### Resultados

Se você enviar uma solicitação de serviço httpbin com caminho / baz, o cabeçalho não será injetado por Kong, pois este endpoint não foi configurado para o plugin Response-Transformer

## Conclusão

Você configurou com sucesso um plugin que é executado apenas quando uma solicitação corresponde a uma regra específica do Ingress.

Especificamente, você configurou o Kong para modificar o cabeçalho do echo-server para incluir “demo: injected-by-kong” antes de responder ao cliente.