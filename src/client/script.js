const clipboardText = document.getElementById('clipboardText');
const authModal = document.getElementById('authModal');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const joinButton = document.getElementById('joinButton');
const onlineStatus = document.getElementById('onlineStatus');
const userNameDisplay = document.getElementById('userNameDisplay');
const sendButton = document.getElementById('sendButton');
const disconnectButton = document.getElementById('disconnectButton');


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

