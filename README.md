## Prerequisites
1. K8s cluster(i'm using kind, perhaps could be minikube etc..)
2. kubectl
3. docker-compose for building the apps images for k8s (can also be used for local debugging - both the kafka broker, also option for docker containers of the apps))
4. nodejs (i'm using v20) & nestjs for local debugging

## Deployment

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

### General TODOS:  
1. implement proxy
2. implement autoscaling with keda/other


### Unhandled edge cases: 
1. If in the window between the time the job is created in the web-server, and the time the scraper finished processing it and sent the response back to the web-server, the web-server instance is terminated and it's ip is replaced - then the response will never be sent to the client. Yet, the html response is persisted to the message broker in the dead letter queue.

2. During that same window, the user's connection is closed, and the message is not delivered. In this case, given the time i had, i only logged the html response and the error message to the console.error (ideally would have been persisted to some error DB or external tool).

See alternative architectures section for ways to solve this issue

3. Another edge case is that the consumer disconnects right before the message is being sent to the dead letter queue, causing never ending processing of the same message. 
Specifically, inside the k8s cluster, in case of edge case (1), the onerror/onclose events of the websocket client aren't reached, in this case the promise rejects after some timeout, but seems that the message is being consumed repeatedly. I didn't have the time to fix this issue. 

4. On first try the topic doesn't exist, causing the app to crash. in k8s/docker-compose it's configured to restart automatically, but possibly there are more elegant ways.

### Code improvements:
  1. ConcreteMessageProducerService is a real class but has an unused field outputTopic, but can't be abstract because it needs to   be used as a real instance by the producer using it - maybe can implement it by some smarter inheritence (though the consumer-producer already extends the consumer)  
  2. Web-server app.service binding of handleMessage - maybe there are prettier ways to accomplish that  
  3. Scraper throwing a complex error if sending message to the web-server didn't work, and the consumer catches it - a bit ugly code
  4. More dynamic queue message types (currenly only one type and not dynamic to other types), as well as websocket message types



## Architecture:

### Current architecture:

1. Web server as a websocket server(behind a load balancer) ,and a kafka producer.
   Receives message from user, pubishes to the kafka broker to topic "job-received", upon job finish receives message from the last consumer and sends it to the user.
2. Job manager as a kafka consumer and producer.
   Consumes message from topic "job-recived", validates the message, and pubishes to the topic "job-validated".
3. Scraper as a kafka consumer and a websocket client.
   Consumes message from topic "job-validated", scrapes the url, and sends the response to the 

- If consumer/producer retries exceeded - publish to a dead-letter-queue (potentially on a separate broker), for manual/complex automated replay.
- If user's socket is closed - currently logging to stderr, ideally would be in some error DB or an external logs/monitoring tool

Motivation:
1. Scraping is something that client wants immediately, therefore polling is not desired (also written that "the API receives scrape jobs and returns htmls.", I interpreted it as in the same "request" (websocket message exchange for that matter))
2. Websockets allow for replaying failed messages  (manually/smart automatic mechanism), without requiring polling

Drawbacks:
1. in case of socket connections being closed - message is not returned to the user (can be replayed as mentioned)

### Alternative architecturs:

#### Alternative architecture #1: 
1. Web server as an http server instead of websocket
...(message broker behavior the same)
2. Scraper persists html to DB, requires implementing a transactional outbox pattern for atomicity between broker and DB
3. User polls the job to see if it's finished

  Motivation:
  1. Easier to develop than websockets, no need to handle connection issues
  2. Job's value (i.e html) is persisted to DB, allows easy polling of a big text, more suitable that a message broker for this type of task

  Drawbacks:
  1. Not real-time response as soon as job is finished
  2. Requires implementing transactional outbox pattern between the broker and the DB


#### Alternative architecture #2: 

1. Web server as an http server from the user, and a websocket server for receiving the html

  Motivation:  
  1. Keeping real time nature, while reduces the socket user's websocket connection issues

  Drawbacks:  
  1. If message is not being processed correctly - response isn't returned and user and cannot be "replayed" (unless implementing polling)


#### Alternative architecture #3: 

1. Scraper publishes to another topic (e.g "scraped") 
2. Another, new service consumes from it and sends the websocket message to the webserver.

  Motivation:
  1. Better separation pf concerns - instead of scraper being bothered by both consuming from broker, scraping, and websocket message sending

  Drawbacks:
  1. Not in the task description
  2. Another service (and topic etc..) to handle, but that's relatively negligeble


### Current Architecture diagram:

![My Flowchart](docs/architecture_diagram.png)

