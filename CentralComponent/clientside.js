//Script for CLIENT WEBSOCKET CONNECTION, Written Completely by Dominic Nguyen
const WebSocket = require('ws');
const { exec } = require('child_process');

// WebSocket connection URL
const socketUrl = 'wss://www.jmuautofeeder.com';

// Create a new WebSocket instance
const ws = new WebSocket(socketUrl);

// WebSocket connection event handlers
// Allows a visual viewing via the terminal of a successful connection
ws.on('open', function open() {
    console.log('WebSocket connection established');
});

ws.on('message', async function incoming(data) {
    // Parse the received message as a JSON object
    const message = JSON.parse(data);
    console.log('Received message from server:', message);

    // Check if the message contains the 'amount' field
    if ('amount' in message) {
        // Parse the amount from the message
        const amount = parseInt(message.amount);

        // Define a function to run the motor2.py script,dispensing the food
        const runScript = async () => {
            return new Promise((resolve, reject) => {
                exec('python motor2.py', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing script: ${error}`);
                        reject(error);
                    } else {
                        console.log(`Script Executing ${stdout}`);
                        resolve();
                    }
                });
            });
        };

        // Run the script 'amount' times sequentially, running one after another.
        // Resolves issue of script running one after the other that occurred before.
        for (let i = 0; i < amount; i++) {
            try {
                await runScript();
                // Notify server of successful script execution with the id value included
                ws.send(JSON.stringify({ success: true, id: message.id }));
            } catch (error) {
                // Handle error if needed
                console.error("Error running script:", error);
                // Notify server of failed script execution with the id value included
                ws.send(JSON.stringify({ success: false, id: message.id }));
            }
        }
    }
});


ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

ws.on('close', function close() {
    console.log('WebSocket connection closed');
});
