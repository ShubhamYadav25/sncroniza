const clipboardText = document.getElementById('clipboardText');
const authModal = document.getElementById('authModal');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const joinButton = document.getElementById('joinButton');
const onlineStatus = document.getElementById('onlineStatus');
const userNameDisplay = document.getElementById('userNameDisplay');
const sendButton = document.getElementById('sendButton');
const disconnectButton = document.getElementById('disconnectButton');

DrawNeuralNetWorkBackGroun();

// Show the modal on page load
window.onload = () => {
    authModal.style.display = 'block';
};

// Handle the Join button click
joinButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    if (password != '1') {
        alert('Please enter correct password.');
        return;
    }

    // Here you can add your authentication logic, such as validating credentials.
    console.log(`Username: ${username}, Password: ${password}`);

    // Hide the modal after successful validation
    authModal.style.display = 'none';

    // Display online status
    userNameDisplay.textContent = username;
    onlineStatus.style.display = 'flex';

    /**
     * 
     *WARN : if your connection is secure then use 'wss' here otherwise use 'ws' 
    * 
    */
    const socket = new WebSocket('wss://delhi-shubhamq.loca.lt');  // ${window.location.hostname}:3000

    socket.onopen = () => {
        console.log('Connected to WebSocket server');

        // start PING - PONG mechanism
        startPingPong();
    };

    // Receive data from WebSocket server
    socket.onmessage = (event) => {

        // Parse broadcasted data received from server 
        const receivedMessageFromServer = JSON.parse(event.data.toString('utf-8'));

        if (receivedMessageFromServer.type === 'pong') {
            console.log('Received pong from server');
        } else {
            // clipboardText.value = event.data;
            displayMessage(receivedMessageFromServer.sender, receivedMessageFromServer.content, false);
        }

    };

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    // // Detect clipboard changes
    // clipboardText.addEventListener('input', () => {
    //     const text = clipboardText.value;
    //     socket.send(text); // Send updated clipboard data to the server
    // });

    sendButton.addEventListener('click', () => {
        const message = clipboardText.value.trim();

        if (message === '') {
            alert('Message cannot be empty!');
            return;
        }

        const text = clipboardText.value;
        socket.send(JSON.stringify({ type: 'message', sender: usernameInput.value, content: message })); // Send updated clipboard data to the server

        // display msg in chat room
        displayMessage(usernameInput.value, message, true);

        // Clear the input field after sending
        clipboardText.value = '';
    });

    disconnectButton.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close(); // Gracefully close the WebSocket connection
            alert('You have disconnected from the chat.');
        } else {
            alert('Connection is already closed.');
        }

        window.location.reload();
    });

    function startPingPong() {
        // Send ping every 10 seconds
        pingInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ping' }));
                console.log('Sent ping to server');
            }
        }, 30000); // Ping every 10 seconds
    }

    // On page load, load clipboard content into the textarea
    navigator.clipboard.readText().then(text => {
        clipboardText.value = text;
    }).catch(err => console.error('Clipboard read failed: ', err));

});

// Display a message in the chat room
function displayMessage(sender, message, isSelf) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isSelf ? 'self' : 'other');
    messageElement.innerHTML = `
        <span class="username">${sender}:</span>    
        <span>${message}</span>
    `;
    messagesContainer.appendChild(messageElement);

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function DrawNeuralNetWorkBackGroun() {
    // Get 2D canva
    const canvas = document.getElementById('neuralCanvas');
    const ctx = canvas.getContext('2d');

    // Canvas fits the entire screen, we adjust its size dynamically:
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    //------------------------------------------------  Neural network data
    /**
     * Nodes: Represented as circles with x/y coordinates and radii.
     * Connections: Lines connecting pairs of nodes.
     */

    const nodes = [];
    const connections = [];

    // Initialize neural network nodes and connections
    function setupNeuralNetwork() {

        /**
         * node has properties like position (x, y), radius r, and movement velocity (vx, vy)
         */
        for (let i = 0; i < 50; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 5 + 3,
                vx: (Math.random() - 0.5) * 2, // Random velocity (-1 to 1)
                vy: (Math.random() - 0.5) * 2, // Random velocity (-1 to 1)
                hovered: false,
            });
        }

        // Connections link two random nodes
        for (let i = 0; i < 100; i++) {
            connections.push({
                a: nodes[Math.floor(Math.random() * nodes.length)], // Start node
                b: nodes[Math.floor(Math.random() * nodes.length)], // End node
            });
        }
    }

    // Handle mouse movement
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        nodes.forEach((node) => {
            const dx = node.x - mouseX;
            const dy = node.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            node.hovered = distance < node.r + 5; // Mark as hovered if within radius
        });
    });

    /**
     * Drawing the Neural Network Connections: Lines between connected nodes.Nodes: Circles, with special styling if hovered.
     */
    function drawNeuralNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        ctx.strokeStyle = 'rgba(200, 100, 255, 0.6)';
        connections.forEach(({ a, b }) => {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach((node) => {
            ctx.beginPath();

            if (node.hovered) {
                ctx.fillStyle = 'rgba(255, 255, 100, 1)'; // Highlight hovered node
                ctx.arc(node.x, node.y, node.r + 3, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = 'rgba(255, 100, 150, 0.9)'; // Default color
                ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            }

            ctx.fill();
        });

        /**
         * Animating Nodes To make the nodes move:
         * Update each node's position based on its velocity (vx, vy).
         * Reverse velocity if the node hits the canvas edge (to "bounce").
         */
        nodes.forEach((node) => {
            node.x += node.vx;
            node.y += node.vy;

            // Reverse direction if a node hits the edge
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        });

        requestAnimationFrame(drawNeuralNetwork);
    }

    // Initialize and start the animation
    setupNeuralNetwork();
    drawNeuralNetwork();
}