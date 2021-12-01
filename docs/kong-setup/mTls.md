---
sidebar_position: 1
---

# mTLS Setup
Mutual TLS, ou mTLS para abreviar, é um método para autenticação mútua. O mTLS garante que as partes em cada extremidade de uma conexão de rede sejam quem afirmam ser, verificando se ambas têm a chave privada correta. As informações em seus respectivos certificados TLS fornecem verificação adicional.

O mTLS é freqüentemente usado em estruturas de segurança Zero Trust para verificar usuários, dispositivos e servidores dentro de uma organização. Também pode ajudar a manter as APIs seguras.

Zero Trust significa que nenhum usuário, dispositivo ou tráfego de rede é confiável por padrão, uma abordagem que ajuda a eliminar muitas vulnerabilidades de segurança.

No modo híbrido, o mTLS é usado para autenticação de forma que a chave privada real nunca seja transferida na rede e a comunicação entre os nós CP e DP seja segura.

Antes de usar o modo híbrido, você precisa de um certificado / par de chaves. O Kong Gateway oferece dois modos para lidar com pares de certificados / chaves:

 - **Modo compartilhado** (Padrão): Use o Kong CLI para gerar um certificado / par de chaves e, a seguir, distribua as cópias entre os nós. O certificado / par de chaves é compartilhado pelos nós CP e DP.
 - **Modo PKI**: Fornece certificados assinados por uma autoridade de certificação central (CA). O Kong valida ambos os lados verificando se eles são do mesmo CA. Isso elimina os riscos associados ao transporte de chaves privadas.

## Crie um certificado / par de chaves
Para facilitar a implantação, usaremos o modo compartilhado e o OpenSSL para emitir o par. O comando abaixo cria dois arquivos cluster.key e cluster.crt.

```bash
  openssl req -new -x509 -nodes -newkey ec:<(openssl ecparam -name secp384r1) \
    -keyout ./cluster.key -out ./cluster.crt \
    -days 1095 -subj "/CN=kong_clustering"
```

### Crie um namespace para o Control plane kong e os Data Plane kong
```bash
  kubectl create namespace kong
```

```bash
  kubectl create namespace kong-dp
```

### Crie um secret do Kubernetes com o par
```bash
  kubectl create secret tls kong-cluster-cert --cert=./cluster.crt --key=./cluster.key -n kong
```

### Monte a chave de licença como Kubernetes Secret
Para namespace do control plane
```bash
  kubectl create secret -n kong generic kong-enterprise-license --from-file=license=./license.json
```

Para namespace de data plane
```bash
  kubectl create secret -n kong-dp generic kong-enterprise-license --from-file=license=./license.json
```

Você agora atingiu o final deste módulo ao provisionar o par de chaves de certificado, necessário para provisionar o Kong Control Plane
