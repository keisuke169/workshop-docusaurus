---
sidebar_position: 2
---

# Command Line Utilities

## Iniciando AWS Cloud9
Você pode iniciar o AWS CloudShell no AWS Management Console abrindo este link.

 - Selecione Criar ambiente
 - Dê um nome que você goste
 - Deixe as configurações padrão e clique em Próxima etapa e Próxima etapa para criar ambiente

Após a execução, criaremos um diretório bin para salvar todos os binários na unidade inicial, para que seja mais fácil de limpar (se necessário)

```bash
mkdir -p $HOME/bin
echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc
```
## Instale EKSCTL
Este tópico cobre o eksctl, um utilitário de linha de comando simples para criar e gerenciar clusters Kubernetes no Amazon EKS. O utilitário de linha de comando eksctl fornece a maneira mais rápida e fácil de criar um novo cluster com nós para Amazon EKS.

Para mais informações e para ver a documentação oficial, visite https://eksctl.io/.

Baixe, extraia e instale a versão mais recente do eksctl com o seguinte comando

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
mv /tmp/eksctl ~/bin
eksctl version
. <(eksctl completion bash)
```

## Instale o kubectl
O Kubernetes usa um utilitário de linha de comando chamado kubectl para se comunicar com o servidor da API do cluster. O binário kubectl está disponível em muitos gerenciadores de pacotes do sistema operacional e esta opção é geralmente muito mais fácil do que um processo manual de download e instalação.
Baixe o binário kubectl do Amazon EKS para sua versão do Kubernetes de clusters no Amazon S3. Para baixar a versão Arm, altere amd64 para arm64 antes de executar o comando.

```bash
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.21.2/2021-07-05/bin/linux/amd64/kubectl
chmod +x ./kubectl
cp ./kubectl $HOME/bin/kubectl
```
## Instale o helm

```bash
curl https://get.helm.sh/helm-v3.7.0-linux-amd64.tar.gz | tar xz -C /tmp
mv /tmp/linux-amd64/helm ~/bin
helm version
```
## Instale o Openssl
```bash
sudo yum -y install openssl jq siege
```
## Gerenciamento de identidade e acesso

```bash
aws ec2 associate-iam-instance-profile --instance-id $(curl http://169.254.169.254/latest/meta-data/instance-id) --iam-instance-profile Name=TeamRoleInstanceProfile
aws configure set region `curl --silent http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region`
echo "export AWS_REGION=$(curl --silent http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region)" >> ~/.bashrc
bash
```
## Mudança nas configurações do Cloud9

:::info Info
Cloud9 normalmente gerencia as credenciais IAM dinamicamente. No momento, isso não é compatível com a autenticação EKS IAM, então vamos desabilitá-lo e contar com a função IAM.
:::

 - Em seu ambiente Cloud9, clique no ícone de engrenagem (no canto superior direito)
 - Selecione AWS SETTINGS
 - Desative as credenciais temporárias gerenciadas pela AWS

![Cloud9](images/../../../images/setup/c9disableiam.png)