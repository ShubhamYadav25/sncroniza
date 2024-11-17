const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');
const localtunnel = require('localtunnel');

const { getIPAddress } = require('../shared/utils');
const { SERVER_PORT, LOCAL_TUNNEL_SUBDOMAIN, MessageEvent, CloseEvent, UTF_8 } = require('../shared/constant');


const app = express();
const server = http.createServer(app);

// Render HTML
app.use(express.static(path.join(__dirname, '../client')));

const wss = new WebSocket.Server({ server });

// connected clients
let connectedClients = [];

// handling new connections
wss.on('connection', (ws) => {

    console.log('New client connected');
    connectedClients.push(ws);

    //Handling messages from clients
    ws.on(MessageEvent, (data) => {

        // convert raw binary data: WebSocket.RawData to readable string
        const parsedData = JSON.parse(data);
        console.log(parsedData);

        // send the data to all connected clients
        connectedClients.forEach(client => {

            // checking client is not sender and ensuring connected client is still awake
            if (client !== ws && client.readyState === WebSocket.OPEN) {

                // send the msg to connected clients
                client.send(JSON.stringify({
                    type: 'message',
                    sender: parsedData.sender,
                    content: parsedData.content,
                }));
                console.log("Server is sending data > "+ parsedData +"\n")
            }
        });
    });

    // handling client disconnections
    ws.on(CloseEvent, () => {
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