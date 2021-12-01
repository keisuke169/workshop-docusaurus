---
sidebar_position: 3
---

# Key Authentication

Adicione a autenticação de chave (também chamada de chave API) a um serviço ou rota. Os consumidores então adicionam sua chave de API em um parâmetro de string de consulta, um cabeçalho ou um corpo de solicitação para autenticar suas solicitações.

Para obter mais detalhes, consulte Plug-in de autenticação de chave.

Nesta seção, você configurará o plug-in Key-Auth em um recurso de serviço. Especificamente, você configurará o Kong para exigir que as solicitações ao serviço httpbin sejam autenticadas usando uma chave API.

## Adicionar o plugin Kong Key Authentication

Adicione um recurso KongPlugin para autenticação, especificamente o plugin key-auth

```bash
echo '
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: httpbin-auth
plugin: key-auth
' | kubectl apply -f -
```

### Resposta

```bash
kongplugin.configuration.konghq.com/httpbin-auth created
```

## Associar plugin ao serviço

Associe o plugin key-auth ao serviço httpbin em execução no cluster. Aplique este patch.

```bash
kubectl patch service httpbin -p '{"metadata":{"annotations":{"konghq.com/plugins":"httpbin-auth"}}}'
```

### Resposta

```bash
service/httpbin patched
```

## Verificando se a autenticação é necessária

Envie uma solicitação ao serviço httpbin, por meio dos endpoints /baz e /foo. Agora, ele requer autenticação, independentemente da regra de ingresso que corresponda.

### Requisição 1

```bash
curl -I $DATA_PLANE_LB/baz
```

### Resposta
```bash
HTTP/1.1 401 Unauthorized
Date: Tue, 19 Oct 2021 19:46:22 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
WWW-Authenticate: Key realm="kong"
Content-Length: 45
X-Kong-Response-Latency: 0
Server: kong/2.6.0.0-enterprise-edition
```
### Requisição 2

```bash
curl -I $DATA_PLANE_LB/foo
```

### Resposta
```bash
HTTP/1.1 401 Unauthorized
Date: Tue, 19 Oct 2021 19:46:22 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
WWW-Authenticate: Key realm="kong"
Content-Length: 45
X-Kong-Response-Latency: 0
Server: kong/2.6.0.0-enterprise-edition
```

### Resultados

Para ambas as solicitações, a resposta é HTTP/1.1 401 Unauthorized. O serviço httpbin requer autenticação.

Observe na última solicitação que o cabeçalho “demo: injected-by-kong” foi injetado. Essa solicitação também corresponde a uma das regras definidas no recurso de ingresso de demonstração (configurado anteriormente).

Agora você configurará os recursos KongConsumer e KongCredential para provisionamento. Esses recursos podem ser usados para fornecer Consumidores e credenciais associadas no Kong.

Especificamente, você configurará um KongConsumer: **harry** com uma chave: **my-sooper-secret-key**.

## Crie um KongConsumer

Crie um recurso KongConsumer

```bash
echo '
apiVersion: configuration.konghq.com/v1
kind: KongConsumer
metadata:
  name: harry
  annotations:
    kubernetes.io/ingress.class: kong
username: harry
' | kubectl apply -f -
```

### Resposta
```bash
kongconsumer.configuration.konghq.com/harry created
```

## Crie um recurso secreto com uma chave de API dentro dele

Crie um recurso Secret com uma chave de API dentro dele. Especifique para incluir:

 1. O tipo de credencial como autenticação por chave
 2. A chave de API usando o valor de configuração de chave, por exemplo my-sooper-secret-key

```bash
kubectl create secret generic harry-apikey  \
  --from-literal=kongCredType=key-auth  \
  --from-literal=key=my-sooper-secret-key
```

### Resposta

```bash
secret/harry-apikey created
```

O tipo de credencial é especificado por meio de kongCredType. Você também pode criar o segredo usando qualquer outro método.

Como estamos usando o recurso Secret, o Kubernetes criptografará e armazenará essa chave de API para nós.

## Associe a chave API ao consumidor

Em seguida, associe esta chave API ao consumidor que criamos anteriormente.

```bash
echo '
apiVersion: configuration.konghq.com/v1
kind: KongConsumer
metadata:
  name: harry
  annotations:
    kubernetes.io/ingress.class: kong
username: harry
credentials:
- harry-apikey
' | kubectl apply -f -
```

Observe que não estamos recriando o recurso KongConsumer, mas apenas atualizando-o para adicionar a matriz de credenciais:
### Resposta

```bash
kongconsumer.configuration.konghq.com/harry configured
```

## Verifique a chave de API
Use o apikey para passar a autenticação para acessar os serviços.

### Requisição 1

```bash
curl -I $DATA_PLANE_LB/foo -H 'apikey: my-sooper-secret-key'
```

### Resposta
```bash
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 9593
Connection: keep-alive
Server: gunicorn/19.9.0
Date: Tue, 19 Oct 2021 19:47:52 GMT
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Kong-Upstream-Latency: 2
X-Kong-Proxy-Latency: 2
Via: kong/2.6.0.0-enterprise-edition
```
### Requisição 2

```bash
curl -I $DATA_PLANE_LB/baz -H 'apikey: my-sooper-secret-key'
```

### Resposta
```bash
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 9593
Connection: keep-alive
Server: gunicorn/19.9.0
Date: Tue, 19 Oct 2021 19:47:52 GMT
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Kong-Upstream-Latency: 2
X-Kong-Proxy-Latency: 2
Via: kong/2.6.0.0-enterprise-edition
```
### Resultados

Ambas as solicitações agora devem responder com um HTTP/1.1 200 OK.

O apikey: my-sooper-secret-key associado ao consumidor: harry passa a autenticação imposta pelo Kong no serviço httpbin.

Observe a resposta Access-Control-Allow-Credentials: true que indica isso.

## Conclusão

Você aproveitou o plug-in de autenticação de chave no Kong e forneceu credenciais a um consumidor. Isso permite que você descarregue a autenticação em sua camada de entrada e mantém a lógica do aplicativo simples.

Todos os outros plug-ins de autenticação agrupados com Kong funcionam dessa maneira e podem ser usados para adicionar rapidamente uma camada de autenticação em cima de seus microsserviços