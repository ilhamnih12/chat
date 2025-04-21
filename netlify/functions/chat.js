const { Server } = require('ws');

let clients = [];

const server = new Server({ noServer: true });

server.on('connection', (socket) => {
  clients.push(socket);

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    clients.forEach((client) => {
      if (client !== socket && client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  socket.on('close', () => {
    clients = clients.filter((client) => client !== socket);
  });
});

exports.handler = (event, context) => {
  if (event.headers['upgrade'] !== 'websocket') {
    return {
      statusCode: 400,
      body: 'WebSocket connections only',
    };
  }

  return new Promise((resolve, reject) => {
    server.handleUpgrade(event, context, (ws) => {
      server.emit('connection', ws, event);
    });
  });
};
