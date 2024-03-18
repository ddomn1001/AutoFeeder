//Script for CLIENT WEBSOCKET CONNECTION, Written Completely by Dominic Nguyen
const WebSocket = require('ws');
const https = require('https');
const { exec } = require('child_process');

// WebSocket connection URL
const socketUrl = 'wss://www.jmuautofeeder.com';

// Create a new WebSocket instance
const ws = new WebSocket(socketUrl);

// WebSocket connection event handlers
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

        // Define a function to run the motor2.py script, dispensing the food
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

        // Run the script 'amount' times sequentially
        for (let i = 0; i < amount; i++) {
            try {
                await runScript();
                // Notify server of successful script execution with the id value included
                const postData = JSON.stringify({ success: true, id: message.id });
                const options = {
                    hostname: 'www.jmuautofeeder.com',
                    port: 443,
                    path: '/notify',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': postData.length
                    }
                };

                const req = https.request(options, (res) => {
                    console.log(`statusCode: ${res.statusCode}`);
                    res.on('data', (d) => {
                        process.stdout.write(d);
                    });
                });

                req.on('error', (error) => {
                    console.error(error);
                });

                req.write(postData);
                req.end();
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
