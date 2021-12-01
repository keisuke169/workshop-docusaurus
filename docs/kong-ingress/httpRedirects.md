---
sidebar_position: 6
---
# Redirecionamento HTTP

Este guia explica como configurar o Kong Ingress Controller para redirecionar a solicitação HTTP para HTTPS, de modo que toda a comunicação do mundo externo com suas APIs e microsserviços seja criptografada.
## Adicionar Ingress de entrada para serviço httpbin

Adicione uma regra de entrada para solicitações de proxy para /foo-redirect para o serviço httpbin

```bash
echo '
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: demo-redirect
  annotations:
    konghq.com/strip-path: "true"
    kubernetes.io/ingress.class: kong
spec:
  rules:
  - http:
      paths:
      - path: /foo-redirect
        backend:
          serviceName: httpbin
          servicePort: 80
' | kubectl apply -f -
```

### Resposta
```bash
ingress.extensions/demo-redirect created
```

### Verifique
Teste a regra de entrada:
```bash
curl -i  $DATA_PLANE_LB/foo-redirect/status/200
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

## Configurar redirecionamento de HTTPs

Crie um recurso KongIngress que aplicará uma política no Kong para aceitar apenas solicitações HTTPS para a regra de entrada acima e enviar de volta um redirecionamento se a solicitação corresponder à regra de entrada.
```bash
echo '
apiVersion: configuration.konghq.com/v1
kind: KongIngress
metadata:
    name: demo-redirect
route:
  protocols:
  - https
  https_redirect_status_code: 302
' | kubectl apply -f -
```
### Resposta

```bash
kongingress.configuration.konghq.com/https-only created
```
## Associe o recurso KongIngress

Associe o recurso KongIngress ao recurso Ingress que você criou para o serviço.

```bash
kubectl patch ingress demo-redirect -p '{"metadata":{"annotations":{"konghq.com/override":"https-only"}}}'
```
## Resposta
```bash
ingress.extensions/demo patched
```
## Teste-o
Faça uma solicitação HTTP em texto simples para Kong.

```bash
curl $DATA_PLANE_LB/foo-redirect/headers -I
```

### Resposta

```bash
HTTP/1.1 302 Moved Temporarily
Date: 
Content-Type: text/html
Content-Length: 167
Connection: keep-alive
Location: https://35.197.125.63/foo-redirect/headers
Server: kong/2.x
```
### Resultados
O resultado é um redirecionamento - 302 Moved Temporarily -  emitido de Kong como esperado.

O cabeçalho Location conterá o URL que você precisa usar para uma solicitação HTTPS.

Observe que este URL será diferente dependendo do seu método de instalação. Você também pode obter o endereço IP do Kong de balanceamento de carga e enviar uma solicitação HTTPS para testá-lo.

## Verifique o acesso HTTPs
Use o header de localização para acessar o serviço via HTTPS.
Lembre-se de substituir o URL do local pelo acima.

```bash
curl -k Location URL
```
### Response
```bash
{
  "headers": {
    "Accept": "*/*",
    "Connection": "keep-alive",
    "Host": "35.197.125.63",
    "User-Agent": "curl/7.54.0",
    "X-Forwarded-Host": "35.197.125.63"
  }
}
```
## Resultados
Você pode ver que Kong atende corretamente a solicitação apenas no protocolo HTTPS e redireciona o usuário se o protocolo HTTP de texto simples for usado. Tivemos que usar o sinalizador `-k` em cURL para pular a validação do certificado, pois o certificado fornecido por Kong é autoassinado. Se você estiver atendendo a esse tráfego por meio de um domínio que você controla e configurou propriedades TLS para ele, o sinalizador não será necessário.