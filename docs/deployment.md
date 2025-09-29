### K8s:
#### Install kafka (note there's also a kafka-ui deployment & service for your cenvenience):
  ```
  kubectl create namespace kafka

  # from https://strimzi.io/quickstarts/
  kubectl create -f k8s/kafka-deployment.yaml -n kafka # from https://strimzi.io/install/latest?namespace=kafka
  kubectl apply -f k8s/kafka-single-node.yaml -n kafka # from https://strimzi.io/examples/latest/kafka/kafka-single-node.yaml
  ```

#### Deploy services:
  build the image  
  load to local k8s registry
  for services that have open ports (web-server) - expose the service itself
  apply the kubectl yaml file  
  scale if you want
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

    # scale
    kubectl patch deployment $SERVICE -n kafka -p '{"spec":{"replicas":2}}'

    # see logs
    kubectl logs $(kubectl get pods -n kafka | grep $SERVICE | awk '{print $1;}') -n kafka -f              
  ``` 

#### Port forward (for debugging from local machine)
  ```
  kubectl port-forward -n kafka deployment/web-server 3001:3001 & kubectl port-forward -n kafka deployment/kafka-ui 8080:8080
  ```

#### The cluster should look something like:

```
% kubectl get pods -n kafka
NAME                                         READY   STATUS    RESTARTS        AGE
job-manager-7b6c7d5f54-c6kc7                 1/1     Running   1 (6m43s ago)   6m45s
kafka-ui-b6fffbf46-27ftp                     1/1     Running   0               3d6h
my-cluster-dual-role-0                       1/1     Running   1 (33h ago)     3d6h
my-cluster-entity-operator-7858b84c5-cbbsq   2/2     Running   0               3d6h
scraper-79db989b69-7865x                     1/1     Running   1 (6m58s ago)   7m
scraper-79db989b69-8k7pj                     1/1     Running   0               6m56s
strimzi-cluster-operator-68b6d74c4b-hgp6k    1/1     Running   221 (91m ago)   3d6h
web-server-7b9d544bf-pzfbd                   1/1     Running   0               6m39s
web-server-7b9d544bf-rhz4l                   1/1     Running   0               6m23s
```

```
% kubectl get services -n kafka
NAME                         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                                        AGE
kafka-ui                     NodePort    10.96.193.217   <none>        8080:32446/TCP                                 3d6h
my-cluster-kafka-bootstrap   ClusterIP   10.96.5.200     <none>        9091/TCP,9092/TCP,9093/TCP                     3d7h
my-cluster-kafka-brokers     ClusterIP   None            <none>        9090/TCP,9091/TCP,8443/TCP,9092/TCP,9093/TCP   3d7h
web-server                   ClusterIP   10.96.26.206    <none>        3001/TCP                                       3d6h
```

```
% kubectl get endpoints -n kafka
Warning: v1 Endpoints is deprecated in v1.33+; use discovery.k8s.io/v1 EndpointSlice
NAME                         ENDPOINTS                                                           AGE
kafka-ui                     10.244.0.182:8080                                                   3d6h
my-cluster-kafka-bootstrap   10.244.0.170:9093,10.244.0.170:9092,10.244.0.170:9091               3d7h
my-cluster-kafka-brokers     10.244.0.170:8443,10.244.0.170:9093,10.244.0.170:9092 + 2 more...   3d7h
web-server                   10.244.0.25:3001,10.244.0.26:3001                                   3d6h
```


### Local debugging:
#### Install kafka using docker-compose
```
  docker-compose up kafka -d
  docker-compose up kafka-ui -d
```

#### docker compose apps locally
run the app you want as docker container, for example:
````
  docker-compose up scraper -d
````

After this the project should look like:
```
% docker compose ps                
NAME             IMAGE                           COMMAND                  SERVICE       CREATED         STATUS         PORTS
kafka            confluentinc/cp-kafka:latest    "/etc/confluent/dock…"   kafka         2 days ago      Up 2 days      0.0.0.0:9092-9093->9092-9093/tcp, [::]:9092-9093->9092-9093/tcp, 0.0.0.0:9101->9101/tcp, [::]:9101->9101/tcp
kafka-ui         provectuslabs/kafka-ui:latest   "/bin/sh -c 'java --…"   kafka-ui      2 days ago      Up 2 days      0.0.0.0:9000->8080/tcp, [::]:9000->8080/tcp
my_job_manager   scraper-job-manager             "docker-entrypoint.s…"   job-manager   3 minutes ago   Up 3 minutes   
my_scraper       scraper-scraper                 "docker-entrypoint.s…"   scraper       4 minutes ago   Up 4 minutes   
my_web_server    scraper-web-server              "docker-entrypoint.s…"   web-server    3 minutes ago   Up 3 minutes   0.0.0.0:3001->3001/tcp, [::]:3001->3001/tcp
```


#### Debug locally:
- Note, in first deployment currently the topic doesn't exist until a message is published and error isn't caught (in k8s/docker-compose it's configured to restart automatically), so job-manager and scraper would need to be restarted manually after first failed start.

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

## Sanity E-2-E test:

```
# from k8s cluster pod that has node installed"
const WebSocket = require('ws');

# from browser no need to do anything, but is server is using k8s - goes to same pod every time

# run test code
const ws = new WebSocket('ws://localhost:3001'); # from k8s cluster use "web-server" instead of "localhost"

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