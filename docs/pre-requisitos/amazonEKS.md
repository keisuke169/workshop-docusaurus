---
sidebar_position: 3
---

# Amazon EKS

## Criando EKS Cluster
Crie um cluster Amazon EKS executando o seguinte comando. Este comando irá

 1. Crie um VPC
 2. Crie um cluster EKS nesse VPC
 3. Adicionar nós gerenciados ao Cluster EKS criado
 4. Atualize o kubeconfig, para que você possa executar os comandos kubectl.

```bash
eksctl create cluster
```
***Saída esperada - levará cerca de 15 minutos para que o cluster seja criado. Observe o nome do cluster EKS que está sendo criado e salve-o***

```
[ℹ]  using region us-west-2
[ℹ]  setting availability zones to [us-west-2a us-west-2c us-west-2b]
[ℹ]  subnets for us-west-2a - public:192.168.0.0/19 private:192.168.96.0/19
[ℹ]  subnets for us-west-2c - public:192.168.32.0/19 private:192.168.128.0/19
[ℹ]  subnets for us-west-2b - public:192.168.64.0/19 private:192.168.160.0/19
[ℹ]  nodegroup "ng-98b3b83a" will use "ami-05ecac759c81e0b0c" [AmazonLinux2/1.11]
[ℹ]  creating EKS cluster "floral-unicorn-1540567338" in "us-west-2" region
[ℹ]  will create 2 separate CloudFormation stacks for cluster itself and the initial nodegroup
[ℹ]  if you encounter any issues, check CloudFormation console or try 'eksctl utils describe-stacks --region=us-west-2 --cluster=floral-unicorn-1540567338'
[ℹ]  2 sequential tasks: { create cluster control plane "floral-unicorn-1540567338", create nodegroup "ng-98b3b83a" }
[ℹ]  building cluster stack "eksctl-floral-unicorn-1540567338-cluster"
[ℹ]  deploying stack "eksctl-floral-unicorn-1540567338-cluster"
[ℹ]  building nodegroup stack "eksctl-floral-unicorn-1540567338-nodegroup-ng-98b3b83a"
[ℹ]  --nodes-min=2 was set automatically for nodegroup ng-98b3b83a
[ℹ]  --nodes-max=2 was set automatically for nodegroup ng-98b3b83a
[ℹ]  deploying stack "eksctl-floral-unicorn-1540567338-nodegroup-ng-98b3b83a"
[✔]  all EKS cluster resource for "floral-unicorn-1540567338" had been created
[✔]  saved kubeconfig as "~/.kube/config"
[ℹ]  adding role "arn:aws:iam::376248598259:role/eksctl-ridiculous-sculpture-15547-NodeInstanceRole-1F3IHNVD03Z74" to auth ConfigMap
[ℹ]  nodegroup "ng-98b3b83a" has 1 node(s)
[ℹ]  node "ip-192-168-64-220.us-west-2.compute.internal" is not ready
[ℹ]  waiting for at least 2 node(s) to become ready in "ng-98b3b83a"
[ℹ]  nodegroup "ng-98b3b83a" has 2 node(s)
[ℹ]  node "ip-192-168-64-220.us-west-2.compute.internal" is ready
[ℹ]  node "ip-192-168-8-135.us-west-2.compute.internal" is ready
[ℹ]  kubectl command should work with "~/.kube/config", try 'kubectl get nodes'
[✔]  EKS cluster "floral-unicorn-1540567338" in "us-west-2" region is ready
```

## Checando seu EKS Cluster
```bash
kubectl get pod --all-namespaces
```
### Saída esperada
```bash
NAMESPACE     NAME                      READY   STATUS    RESTARTS   AGE
kube-system   aws-node-ljf7m            1/1     Running   0          6m24s
kube-system   coredns-85cc4f6d5-7sbhc   1/1     Running   0          56m
kube-system   coredns-85cc4f6d5-vkqdv   1/1     Running   0          56m
kube-system   kube-proxy-tv6rb          1/1     Running   0          6m24s
```
## Exporte o nome da função do trabalhador para uso em todo o workshop
```bash
echo "export EKS_CLUSTERNAME=$(cut -d . -f 1 <<< $(cut -d @ -f 2 <<< $(kubectl config current-context)))" >> ~/.bashrc
bash
echo "export STACK_NAME=$(eksctl get nodegroup --cluster $EKS_CLUSTERNAME -o json | jq -r '.[].StackName')" >> ~/.bashrc
bash
echo "export ROLE_NAME=$(aws cloudformation describe-stack-resources --stack-name $STACK_NAME | jq -r '.StackResources[] | select(.ResourceType=="AWS::IAM::Role") | .PhysicalResourceId')" >> ~/.bashrc
bash
```
## Solução de problemas
### E se eu não vir a saída esperada como acima ?
Caso você se desconecte da rede, o AWS Cloudshell pode não ser capaz de concluir todas as ações que são executadas sequencialmente usando o comando eksctl create cluster. Nesse caso, execute as seguintes ações

 1. Liste o cluster criado
```bash
eksctl get cluster
```
### Saída esperada
```bash
[cloudshell-user@ip-10-1-84-202 ~]$ eksctl get cluster
2021-09-28 18:59:40 [ℹ]  eksctl version 0.67.0
2021-09-28 18:59:40 [ℹ]  using region us-east-1
NAME                            REGION          EKSCTL CREATED
scrumptious-creature-1632854050 us-east-1       True
```

 2. Escreva para KubeConfig. Substitua YOUR_CLUSTER pelo cluster que foi criado quando você executou inicialmente o comando eksctl create cluster

```bash
eksctl utils write-kubeconfig --cluster YOUR_CLUSTER
```