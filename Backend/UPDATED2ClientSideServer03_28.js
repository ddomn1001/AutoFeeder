//Originally Written by Dominick Nyguen
//Modified by Hale Anderson and Luke Saunders
const WebSocket = require('ws');
const { exec } = require('child_process');

// WebSocket connection URL
const socketUrl = 'wss://www.jmuautofeeder.com';

// Create a new WebSocket instance
const wss = new WebSocket(socketUrl);

// WebSocket connection event handlers
wss.on('open', function open() {
    console.log('WebSocket connection established');
});

wss.on('message', async function incoming(data) {
    // Parse the received message as a JSON object
    const message = JSON.parse(data);
    console.log('Received message from server:', message);

    // Check if the message contains the 'amount' field
    if ('amount' in message) {
        // Parse the amount from the message
        const amount = parseInt(message.amount);



        // Run the motor script 'amount' times sequentially
        for (let i = 0; i < amount; i++) {
            try {
                // Execute motor script
                await runScript();
                // Notify server of successful script execution with the id value included
                wss.send(JSON.stringify({ success: true, id: message.id }));
            } catch (error) {
                // Handle error if needed
                console.error("Error running script:", error);
                // Notify server of failed script execution with the id value included
                wss.send(JSON.stringify({ success: false, id: message.id }));
            }
        }

        // Measure distance and send status message after running the motor script loop
        await measureDistanceAndSendStatus(message.id);
    }
});

wss.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

wss.on('close', function close() {
    console.log('WebSocket connection closed');
});

// Function to execute motor script
function runScript() {
    return new Promise((resolve, reject) => {
        exec('python motor2.py', (error, stdout, stderr) => {
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

// Function to measure distance and send status message
async function measureDistanceAndSendStatus(id) {
    try {
        // Measure distance
        const distance = await measureDistance();
        console.log("Distance:", distance);

         let status;
        if (distance === -1000) {
            status = 'sensor_broken';
        } else if (distance <= 10) {
            status = 'good';
        } else if (distance > 10 && distance <= 13) {
            status = 'low';
        } else {
            status = 'empty';
        }

        // Send status message to server
        wss.send(JSON.stringify({ status: status, id: id }));
    } catch (error) {
        console.error("Error measuring distance:", error);
    }
}

// Function to measure distance
function measureDistance() {
    return new Promise((resolve, reject) => {
        exec('python distance_sensor.py', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error measuring distance: ${error}`);
                reject(error);
            } else {
                const distance = parseFloat(stdout.trim());
                if (distance )                
                resolve(distance);
            }
        });
    });
}
