---
sidebar_position: 1
---

# Intro

Agora que enviamos algumas solicitações de amostra no capítulo anterior, vamos visualizar usando Grafana e AWS CloudWatch que configuramos anteriormente.
Vamos enviar mais algumas solicitações, que nos ajudarão a visualizar os dados.

## Gerar Carga

No comando abaixo iremos gerar uma carga de 10 minutos no endpoint /bar

```bash
siege -t 600S -c 255 -i $DATA_PLANE_LB/bar
```
Deixe essa carga continuar sendo gerada e você pode passar para o próximo módulo e começar a visualizar os dados.