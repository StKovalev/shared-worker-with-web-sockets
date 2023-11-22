const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const app = express();

// Используйте общий каталог для запросов к статическим файлам
app.use(express.static("public"));

// Запустите наш WS-сервер с 3001
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", ws => {
  console.log("A new client connected!");
  ws.on("message", data => {
    console.log(`Message from client: ${data}`);
    const parsed = JSON.parse(data);
    ws.send(
      JSON.stringify({
        ...parsed.data,
        messageFromServer: `Hello tab id: ${parsed.data.from}`
      })
    );
  });
  ws.on("close", () => {
    console.log("Sad to see you go :(");
  });

  setTimeout(
    () =>
      ws.send(JSON.stringify({ broadcast: "A broadcast for all clients!" })),
    15000
  );
});

// Прослушивайте запросы для статических страниц по адресу 3000
const server = app.listen(3000, function() {
  console.log("The server is running on http://localhost:" + 3000);
});
