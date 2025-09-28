## Prerequisites
1. K8s cluster(i'm using kind, perhaps could be minikube etc..)
2. kubectl
3. docker-compose for local installation of kafka (also option for deploying the apps)
4. nodejs (i'm using v20) & nestjs for local debugging

## Deployment

### k8s:
#### install kafka (note there's also a kafka-ui deployment & service for your cenvenience):
  ```
  kubectl create namespace kafka
  kubectl create -f k8s/kafka-deployment.yaml -n kafka
  kubectl apply -f k8s/kafka-single-node.yaml -n kafka 
  ```

#### deploy services:
  build the image  
  load to local k8s  
  for services that have open ports (web-server/scraper) - expose the service itself
  apply the kubectl yaml file  
  see logs

  for example this deploys the scraper service:
  ```
    SERVICE=scraper

    # build and load
    docker compose build $SERVICE --progress=plain --no-cache
    kind load docker-image scraper-${SERVICE}:latest

    # only for services that have open ports (web-server/scraper) 
    kubectl apply -f k8s/$SERVICE-service.yaml 
    
    # deployment of services
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
run the app you want as docker container, for example:
````
  docker-compose up scraper -d
````

#### debug locally:
enter the relevant directory for the app you want to debug
install dependencies  
compile  
run the app
```
cd apps/scraper
npm i
npm run build
npm run start:dev
```

## Test:
from browser:
```
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to proxy server.');
};

ws.onmessage = (event) => {
  console.log('Message from server:', event.data);
};

ws.onclose = () => {
  console.log('Disconnected from proxy server.');
};

ws.send(JSON.stringify({event: 'job', message: 'https://google.com'}));

```


## TODOS:  

1. handle lost connections between websockets (meaning if not all are working then messages will be lost)
2. handle connection of web-server if scraper isn't available (currently depends on it)
3. test on load balancer with multiple services instances
4. implement proxy
5. implement autoscaling with keda/other
6. add documentation draw.io
7. add documentation regarding limitations and development flow

