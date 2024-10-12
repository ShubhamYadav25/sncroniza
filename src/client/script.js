const clipboardText = document.getElementById('clipboardText');
console.log("B > ", clipboardText);

/**
 * 
 *WARN : if your connect is secure then use 'wss' here otherwise use 'ws' 
 * 
 */
const socket = new WebSocket('wss://clipboard.loca.lt');  // ${window.location.hostname}:3000

socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

// Receive data from WebSocket server
socket.onmessage = (event) => {
    clipboardText.value = event.data;
    // Update clipboard with the received data
    navigator.clipboard.writeText(event.data).catch(err => console.error('Clipboard write failed: ', err));
};

// Detect clipboard changes
clipboardText.addEventListener('input', () => {
    const text = clipboardText.value;
    socket.send(text); // Send updated clipboard data to the server
});

// On page load, load clipboard content into the textarea
navigator.clipboard.readText().then(text => {
    clipboardText.value = text;
}).catch(err => console.error('Clipboard read failed: ', err));