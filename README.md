# Cloud Library
 
 [![logoCL.png](https://i.postimg.cc/3JbP97c8/logoCL.png)](https://postimg.cc/MvVPpkwN)

## Introduction
Hey visitors🚶‍♀️🚶‍♂️, welcome to CloudLibrary 📚👓

CL is an online archive for your books 😮 📕📗📘📙

Check your collection whenerever you want, and keep an eye on how much you've spent to grow the collection 💸!!

This folder contains:
- docker-compose, which contains configuration to deploy the entire app on docker;
- backend/client.yaml files, which contains configuration to deploy the entire app on k8s;
- k8s folder, which contains kubernetes pods configuration files;
- ansible folder, which contains playbook file to restart k8s pods;
- workflow folder, which contains github actions file;

# Architecture 👷🏻
[![Architecture.png](https://i.postimg.cc/kgH8zbmY/Architecture.png)](https://postimg.cc/PCmP8NN1)

# Installation 🔧

CL requires 
- [Docker](https://www.docker.com/) 
- [Kubernetes](https://kubernetes.io/it/docs/concepts/overview/what-is-kubernetes/) or [Minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Fx86-64%2Fstable%2Fbinary+download) 
- Cloud service, i used [DigitalOcean](https://www.digitalocean.com/products/droplets)


## Launch app on docker

``` sh
$ docker compose up --build   
```

## Stop app
``` sh
$ docker compose down 
```

## Launch app on k8s cluster (Minikube version)

``` sh
$ minikube start
$ kubectl apply -f backend-deployment.yaml
$ kubectl apply -f backend-service.yaml
$ kubectl apply -f client-deployment.yaml
$ kubectl apply -f client-service.yaml
```

## Stop app
``` sh
$ minikube stop
```

## Delete app
``` sh
$ minikube delete --all
```

That's it.
Welcome to CL!

## Usage

After setup the environment let's jump into the core of CL!

Client will be at localhost:3000 if you are using Docker;

Instead, if you are using Kubernetes/Minikube launch:
## Stop app
``` sh
$ kubectl get services
```

Shell will show table like this:

| NAME          | TYPE             | CLUSTER-IP              | EXTERNAL-IP    | PORT(S)            | AGE       |
| ------------- | ---------------- | ----------------------- | -------------- | ------------------ | --------- |
| backend       | ClusterIP        | 10.245.142.123          | <none>         | 8800/TCP           | 23h       |
| client        | LoadBalancer     | 10.245.48.179           | 138.68.124.208 | 3000:30122/TCP     | 23h       |
| kubernetes    | ClusterIP        | 10.245.0.1              | <none>         | 443/TCP            | 23h       |


Go to 138.68.124.208:3000 and you are ready to use CL ^^

Repo contains two more folders:
- client, which contains the code to build frontend of the app 
- backend, which contains the code to build backend of the app
 

Follow their readme files to be part of CL 🧬

HF :) 

# Author 💻 👦
CL has been developed by Claudio Caudullo, Computer Science student at Department of Mathematics and Computer Science, University of Catania, Italy. 

Email: claudiocaudullo01@gmail.com
