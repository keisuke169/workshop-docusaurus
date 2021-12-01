---
sidebar_position: 1
---

# Introducao

Kong pode limitar a taxa de seu tráfego sem nenhuma dependência externa. Nesse caso, Kong armazena os contadores de solicitação na memória e cada node do Kong aplica a política de limitação de acesso de forma independente. Não há sincronização de informações sendo feita neste caso. Mas se o Redis estiver disponível em seu cluster, Kong pode tirar vantagem disso e sincronizar as informações de limite de acesso em vários nodes do Kong e aplicar uma política de limitação de acesso ligeiramente diferente.

Este guia percorre as etapas de uso do Redis para limitação de taxa em uma implantação do Kong de vários nodes.

## Tarefas de alto nível

Você irá completar o seguinte:

 - Configurar regra de entrada para Redis
 - Configurar plugin de limitação de acesso
 - Dimensione o Kong para Kubernetes para vários pods
 - Implante o Redis em seu cluster Kubernetes
 - Verifique a limitação de acesso no cluster