//CLIENTSIDE SERVER CODE WRITTEN COMPLETELY BY DOMINIC NGUYEN
const WebSocket = require('ws');
const { exec } = require('child_process');

// WebSocket connection URL
const socketUrl = 'wss://www.jmuautofeeder.com';

// Create a new WebSocket instance
const ws = new WebSocket(socketUrl);

// WebSocket connection event handlers
ws.on('open', function open() {
    console.log('WebSocket connection established');
});

ws.on('message', function incoming(data) {
    // Parse the received message as a JSON object
    const message = JSON.parse(data);
    console.log('Received message from server:', message);

    // Check if the message contains the 'amount' field
    if ('amount' in message) {
        // Parse the amount from the message
        const amount = parseInt(message.amount);

        // Run the script 'xyz.py' multiple times based on the amount
        for (let i = 0; i < amount; i++) {
            exec('python testScript.py', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error}`);
                    return;
                }
                console.log(`Script output: ${stdout}`);

                // Notify server of successful script execution with the id value included
                ws.send(JSON.stringify({ success: true, id: message.id }));
            });
        }
    }
});



ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

ws.on('close', function close() {
    console.log('WebSocket connection closed');
});
