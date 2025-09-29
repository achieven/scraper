## Architecture:
[Architecture](./docs/architecture.md)

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
2. If user is actually an externally exposed api and not an internally developed frontend - they also depend on communicating using websockets instead of http

### Alternative architectures

#### #1 - http & polling from DB: 
1. Web server as an http server instead of websocket
2. Scraper persists html to DB - requires implementing a transactional outbox pattern for atomicity between broker and DB
3. User polls the job to see if it's finished

  Motivation:
  1. Easier to develop than websockets, no need to handle connection issues
  2. Job's value (i.e html) is persisted to DB, allows easy polling of a big text, more suitable that a message broker for this type of task

  Drawbacks:
  1. Not real-time response as soon as job is finished
  2. Requires implementing transactional outbox pattern between the broker and the DB


#### #2 - http & websockets combined: 

1. Web server as an http server from the user, and a websocket server for receiving the html

  Motivation:  
  1. Keeping real time nature
  2. Reduces the socket user's websocket connection issues
  3. Suitable if user is actually an api and not a frontend web app developed internally

  Drawbacks:  
  1. If message is not being processed correctly - response isn't returned and user and cannot be "replayed" (unless implementing polling)


#### #3 - adding a "responder" service as last step: 

1. Scraper publishes to another topic (e.g "scraped") 
2. Another, new service consumes from it and sends the websocket message to the webserver.

  Motivation:
  1. Better separation pf concerns - instead of scraper being bothered by both consuming from broker, scraping, and websocket message sending

  Drawbacks:
  1. Not in the task description
  2. Another service (and topic etc..) to handle, but that's relatively negligeble

#### #4 - #2 & #3 combined:
  Motivation:
  1. Best of both worlds (keeping real-time behavior, separation of concerns, websocket connection issues, suitable for external api)

  Drawbacks:
  1. Worst of both worlds :smile: (requires implementing polling for replaying, more services to manage)


### Current Architecture diagram:

https://drive.google.com/file/d/1o9qlkZcMoZ1At15dyXwZg4yLJdd80Mwr/view?usp=sharing

![My Flowchart](./architecture_diagram.png)