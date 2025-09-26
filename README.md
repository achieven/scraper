## Prerequisites
1. K8s cluster(i'm using kind, perhaps could be minikube etc..)
2. kubectl
3. docker-compose for local installation of kafka (also option for deploying the apps)
4. nodejs (i'm using v20) & nestjs for local debugging

## Deployment

### k8s:
#### install kafka:
  ```
  kubectl create namespace kafka
  kubectl create -f k8s/kafka-deployment.yaml -n kafka
  kubectl apply -f k8s/kafka-single-node.yaml -n kafka 
  ```

#### deploy services:

  build the image  
  load to local k8s  
  apply the kubectl yaml file  
  see logs
  ```
    SERVICE=scraper
    docker compose build $SERVICE --progress=plain --no-cache
    kind load docker-image scraper-${SERVICE}:latest
    kubectl delete -f k8s/$SERVICE-deployment.yaml 
    kubectl apply -f k8s/$SERVICE-deployment.yaml 
    kubectl logs $(kubectl get pods -n kafka | grep $SERVICE | awk '{print $1;}') -n kafka -f              
  ```  

#### port forward
  ```
  kubectl port-forward -n kafka deployment/web-server 3001:3001 && kubectl port-forward -n kafka deployment/kafka-ui 8080:8080
  ```

### local debugging:
#### install kafka using docker-compose
```
  docker-compose up kafka -d
  docker-compose up kafka-ui -d
```

#### docker compose apps locally
run the app as docker container
````
  docker-compose up scraper -d
````

#### debug locally:
enter the relevant directory  
install dependencies  
compile  
run the app
```
cd apps/scraper
npm i
npm run build
npm run start:dev
```

