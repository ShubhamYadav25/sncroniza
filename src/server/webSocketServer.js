const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');
const localtunnel = require('localtunnel');

const {getIPAddress} = require('../shared/utils');
const {SERVER_PORT, LOCAL_TUNNEL_SUBDOMAIN} = require('../shared/constant');


const app = express();
const server = http.createServer(app);

// Render HTML
app.use(express.static(path.join(__dirname, '../client')));

const wss = new WebSocket.Server({ server });

let connectedClients = [];

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  connectedClients.push(ws);

  ws.on('message', (data) => {

    // convert data: WebSocket.RawData to readable string
    const message = data.toString('utf-8');
    console.log(message);

    // send the data to all connected clients
    connectedClients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    connectedClients = connectedClients.filter(client => client !== ws);
    console.log('Client disconnected');
  });
});


const localIp = getIPAddress();

server.listen(SERVER_PORT, async () => {
  console.log(`Server running at http://${localIp}:${SERVER_PORT}`);

  const tunnel = await localtunnel({ port: SERVER_PORT, subdomain: LOCAL_TUNNEL_SUBDOMAIN });

  console.log(`Tunnel is open at ${tunnel.url}`);

  tunnel.on('close', () => {
    console.log('Tunnel is closed');
  });
});