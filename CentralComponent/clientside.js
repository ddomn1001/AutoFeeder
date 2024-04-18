// Updated clientside_script.js

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

ws.on('message', async function incoming(data) {
    // Parse the received message as a JSON object
    const message = JSON.parse(data);
    console.log('Received message from server:', message);

    // Check if the message contains the 'amount' and 'username' fields
    if ('amount' in message && 'username' in message) {
        const username = message.username;

        // Parse the amount from the message
        const amount = parseInt(message.amount);

        // Run the motor script 'amount' times sequentially
        for (let i = 0; i < amount; i++) {
            try {
                // Execute motor script with username
                await runScript(username);
                // Notify server of successful script execution with the id value included
                ws.send(JSON.stringify({ success: true, id: message.id }));
            } catch (error) {
                // Handle error if needed
                console.error("Error running script:", error);
                // Notify server of failed script execution with the id value included
                ws.send(JSON.stringify({ success: false, id: message.id }));
            }
        }

        // Measure distance and send status message after running the motor script loop
        await measureDistanceAndSendStatus(message.id, username);

        // Take picture and send image data
        await takePicture(username, message.id);
    }
});

ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

ws.on('close', function close() {
    console.log('WebSocket connection closed');
});

// Function to execute motor script
function runScript(username) {
    return new Promise((resolve, reject) => {
        exec(`python3 motor2.py ${username}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing motor2.py: ${error}`);
                reject(error);
            } else {
                console.log(`motor2.py Executed: ${stdout}`);
                resolve();
            }
        });
    });
}

// Function to measure distance, send status message
async function measureDistanceAndSendStatus(id, username) {
    try {
        // Measure distance
        const distance = await measureDistance();
        console.log("Distance:", distance);

        // Determine status based on distance
        let status;
        if (distance > 20) {
            status = 'Sensor needs realignment';
        } else {
            status = distance < 10 ? 'good' : 'low';
        }

        // Send status message to server
        ws.send(JSON.stringify({ status: status, id: id, username: username }));
    } catch (error) {
        console.error("Error measuring distance:", error);
    }
}


// Function to measure distance
function measureDistance() {
    return new Promise((resolve, reject) => {
        exec('python3 distance_sensor.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error measuring distance: ${error}`);
                reject(error);
            } else {
                const distance = parseFloat(stdout.trim());
                resolve(distance);
            }
        });
    });
}

// Function to take picture and send image data
async function takePicture(username, id) {
    try {
        const imageDataBase64 = await captureImage();
        
        // Log the data being sent to the server
        console.log('Sending to server:', { username: username, image_data: imageDataBase64 });

        // Sending both image data and username to the server via WebSocket
        ws.send(JSON.stringify({ username: username, image_data: imageDataBase64 }));

        // Notify server of successful image capture with the id value included
        ws.send(JSON.stringify({ success: true, id: id }));
    } catch (error) {
        console.error("Error taking picture:", error);
    }
}

// Function to capture image and encode to base64
function captureImage() {
    return new Promise((resolve, reject) => {
        exec('python3 camera.py', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing camera.py: ${error}`);
                reject(error);
            } else {
                const imageDataBase64 = stdout.trim();
                resolve(imageDataBase64);
            }
        });
    });
}
