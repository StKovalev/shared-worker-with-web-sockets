const worker = new SharedWorker("worker.js");
const id = uuid.v4();

// Установить начальное состояние
let webSocketState = WebSocket.CONNECTING;

console.log(`Initializing the web worker for user: ${id}`);
worker.port.start();
worker.port.onmessage = event => {
  switch (event.data.type) {
    case "WSState":
      webSocketState = event.data.state;
      break;
    case "message":
      handleMessageFromPort(event.data);
      break;
  }
};

const broadcastChannel = new BroadcastChannel("WebSocketChannel");
broadcastChannel.addEventListener("message", event => {
  switch (event.data.type) {
    case "WSState":
      webSocketState = event.data.state;
      break;
    case "message":
      handleBroadcast(event.data);
      break;
  }
});

// Прослушивание широковещательных передач с сервера
function handleBroadcast(data) {
  console.log("This message is meant for everyone!");
  console.log(data);
}

function handleMessageFromPort(data) {
  console.log(`This message is meant only for user with id: ${id}`);
  console.log(data);
}

// Используйте этот метод для отправки данных на сервер.
function postMessageToWSServer(input) {
  if (webSocketState === WebSocket.CONNECTING) {
    console.log("Still connecting to the server, try again later!");
  } else if (
    webSocketState === WebSocket.CLOSING ||
    webSocketState === WebSocket.CLOSED
  ) {
    console.log("Connection Closed!");
  } else {
    worker.port.postMessage({
      // IВключите информацию об отправителе в качестве uuid, чтобы получить ответ обратно
      from: id,
      data: input
    });
  }
}

setTimeout(() => postMessageToWSServer("Initial message"), 2500);
