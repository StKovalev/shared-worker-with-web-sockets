// Откройте соединение. Это обычное соединение. Оно будет открыто только один раз.
const ws = new WebSocket("ws://localhost:3001");

// Создайте широковещательный канал для уведомления об изменениях состояния
const broadcastChannel = new BroadcastChannel("WebSocketChannel");

// Отображение для отслеживания портов. Вы можете думать о портах как о средах, 
// с помощью которых мы можем взаимодействовать с вкладками и из них.
// Это сопоставление uuid, присвоенного каждому контексту (вкладке), с его портом. 
// Это необходимо, потому что Port API не имеет никакого идентификатора, 
// который мы могли бы использовать для идентификации сообщений, поступающих от него.
const idToPortMap = {};

// Сообщите всем подключенным контекстам (вкладкам) о каналах состояний
ws.onopen = () =>
  broadcastChannel.postMessage({ type: "WSState", state: ws.readyState });
ws.onclose = () =>
  broadcastChannel.postMessage({ type: "WSState", state: ws.readyState });

// Когда мы получаем данные с сервера.
ws.onmessage = ({ data }) => {
  console.log(data);
  // Создайте объект, который будет передан обработчикам
  const parsedData = { data: JSON.parse(data), type: "message" };
  if (!parsedData.data.from) {
    // Широковещательная передача во все контексты (вкладки). Это связано с тем, что здесь в поле from не был задан конкретный идентификатор.
    // Мы используем это поле, чтобы определить, с какой вкладки отправлено сообщение
    broadcastChannel.postMessage(parsedData);
  } else {
    // Получите порт для отправки, используя uuid, т.е. отправляйте только на ожидаемую вкладку.
    idToPortMap[parsedData.data.from].postMessage(parsedData);
  }
};

// Обработчик события вызывается, когда вкладка пытается подключиться к этому работнику.
onconnect = e => {
  const port = e.ports[0];
  port.onmessage = msg => {
    // Соберите информацию о порте на карте
    idToPortMap[msg.data.from] = port;

    // Перешлите это сообщение в ws-соединение.
    ws.send(JSON.stringify({ data: msg.data }));
  };

  // Нам это нужно, чтобы уведомить вновь подключенный контекст о текущем состоянии WS-соединения.
  port.postMessage({ state: ws.readyState, type: "WSState" });
};
