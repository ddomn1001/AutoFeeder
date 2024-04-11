const WebSocket = require('ws');
const NodeWebcam = require('node-webcam');
const { exec } = require('child_process');

// WebSocket connection URL
const socketUrl = 'ws://www.jmuautofeeder.com';

// Create a new WebSocket instance
const ws = new WebSocket(socketUrl);

// Create webcam instance
const Webcam = NodeWebcam.create();

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

        // Run the script 'amount' times sequentially
        for (let i = 0; i < amount; i++) {
            try {
                // Capture an image from the webcam
                Webcam.capture('capture', async function(err, data) {
                    if (err) {
                        console.error('Error capturing image:', err);
                        return;
                    }
                    // Convert the captured image data to base64
                    const imageDataBase64 = data.toString('base64');
                    // Send the base64-encoded image data to the server via WebSocket
                    ws.send(JSON.stringify({ image: imageDataBase64 }));
                    // Execute SCP command to transfer the captured image
                    exec('scp -i ./AWS313AutoFeeder.pem ./capture.bmp ubuntu@44.220.217.210:/home/ubuntu/Autofeeder', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error transferring image: ${error}`);
                            return;
                        }
                        console.log('Image transferred successfully:', stdout);
                    });
                });
                // Notify server of successful image capture with the id value included
                ws.send(JSON.stringify({ success: true, id: message.id }));
            } catch (error) {
                // Handle error if needed
                console.error("Error capturing image:", error);
                // Notify server of failed image capture with the id value included
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
