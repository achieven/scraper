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


