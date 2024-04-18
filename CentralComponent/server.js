//SERVERSIDE CODE
const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
// const session = require('express-session');
const path = require('path');
//const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
//const passport = require('passport');
app.use(bodyParser.json());

// Load SSL certificate and key DOMINIC NGUYEN
const privateKey = fs.readFileSync('/etc/letsencrypt/live/www.jmuautofeeder.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/www.jmuautofeeder.com/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Session middleware setup; owned my Nathan Davis
const session = require('express-session');
app.use(session({
    secret: 'fn889bkh',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// Create HTTPS server DOMINIC NGUYEN
const httpsServer = https.createServer(credentials, app);

// WebSocket server setup DOMINIC NGUYEN
const wss = new WebSocket.Server({ server: httpsServer });
// Serve static files from the root directory
app.use(express.static('/home/ubuntu/Autofeeder'));

// Route for the root URL DOMINIC NGUYEN
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Home.html'));
});

//DOMINIC NGUYEN
const pool = new Pool({
    user: 'ubuntu',
    host: 'localhost',
    database: 'autofeeder',
    password: 'Checkout',
    port: 8963,
});


// Load the secret key from environment variable
//const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtSecretKey = 'tiingoindEIGN232';

function generateAuthToken(username) {
    try {
        console.log('Generating token for username:', username);
        console.log('JWT Secret Key:', jwtSecretKey);
        const token = jwt.sign({ username }, jwtSecretKey, { expiresIn: '1h' });
        console.log('Token generated successfully:', token);
        return token;
    } catch (error) {
        console.error('Error signing JWT token:', error);
        throw new Error('Failed to sign JWT token');
    }
}

// Create account route DOMINIC NGUYEN
app.post('/create-account', async (req, res) => {
    const { email, newUsername, newPassword, fname, lname } = req.body;
    try {
        await pool.query('INSERT INTO login (username, email, password_hash, first_name, last_name) VALUES ($1, $2, crypt($3, gen_salt(\'bf\')), $4, $5)', [newUsername, email, newPassword, fname, lname]);
        res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//Login Route Create & Modified by Dominic Nguyen (modified on 4/16/2024 to grab username, fname, lname, email)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM login WHERE username = $1 AND password_hash = crypt($2, password_hash)', [username, password]);
        if (result.rows.length > 0) {
            // Extract user data
            const { first_name, last_name, email } = result.rows[0];

            // Store user data in session upon successful login
            req.session.username = username;
            const authToken = generateAuthToken(username);

            // Send user data along with success message
            res.status(200).json({ message: 'Login successful', authToken, username, first_name, last_name, email });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// middleware that checks for the session identifier in each request; owned by Nathan Davis
const requireAuth = (req, res, next) => {
    if (req.session.username) {
        next(); // User is authenticated, continue to next middleware
    } else {
        res.redirect('Home.html'); // User is not authenticated, redirect to login page
    }
}

// Route to update feeding information DOMINIC NGUYEN, requireAuth added by Nathan Davis
app.post('/update-feeding-info', requireAuth, async (req, res) => {
    const { fed, amount } = req.body;
    const username = req.session.username; // Retrieve username from session

    console.log('Received feeding information:', { fed, amount, username });

    try {
        const result = await pool.query('INSERT INTO feeding_information (username, fed, amount) VALUES ($1, $2, $3) RETURNING *', [username, fed, amount]);

        const insertedInfo = result.rows[0]; // Retrieve the inserted feeding information

        console.log('Inserted feeding information:', insertedInfo);

        // Send the new feeding information to the client
        const dataToSend = { id: insertedInfo.id, fed, amount, username };
        console.log('Data being sent to client:', dataToSend); // Add this line for logging

        // Broadcast the new feeding information to all connected clients
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(dataToSend));
            }
        });

        res.status(200).json({ message: 'Feeding information updated successfully', insertedInfo }); // Return the inserted feeding information in the response
    } catch (error) {
        console.error('Error updating feeding information:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Route to update scheduled feeding information DOMINIC NGUYEN; requireAuth added by Nathan Davis
app.post('/update-scheduled-feeding-info', requireAuth, async (req, res) => {
    const { time, amount } = req.body;
    const username = req.session.username; // Retrieve username from session

    console.log('Received scheduled feeding information:', { time, amount, username });

    try {
        // Convert time input to a valid time format for PostgreSQL
        const parsedTime = parseTime(time);

        // Insert the scheduled feeding information into the database
        const result = await pool.query('INSERT INTO scheduled_feeding_information (username, feeding_time, amount) VALUES ($1, $2, $3) RETURNING *', [username, parsedTime, amount]);

        const insertedInfo = result.rows[0]; // Retrieve the inserted scheduled feeding information

        console.log('Inserted scheduled feeding information:', insertedInfo);

        // Send the new scheduled feeding information to the client
        const dataToSend = { id: insertedInfo.id, time: parsedTime, amount, username };
        console.log('Data being sent to client:', dataToSend);

        // Broadcast the new scheduled feeding information to all connected clients
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(dataToSend));
            }
        });

        res.status(200).json({ message: 'Scheduled feeding information updated successfully', insertedInfo }); // Return the inserted scheduled feeding information in the response
    } catch (error) {
        if (error.code === '23505') {
            // Unique constraint violation error (duplicate entry)
            console.error('Error updating scheduled feeding information:', error);
            res.status(400).json({ message: 'Scheduled feeding time already exists' });
        } else {
            // Other error
            console.error('Error updating scheduled feeding information:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

// Function to parse time input and convert it to a valid format for PostgreSQL DOMINIC NGUYEN
function parseTime(inputTime) {
    // Define mappings for time values
    const timeMappings = {
        'midnight': '00:00',
        'oneam': '01:00',
        'twoam': '02:00',
        'threeam': '03:00',
        'fouram': '04:00',
        'fiveam': '05:00',
        'sixam': '06:00',
        'sevenam': '07:00',
        'eightam': '08:00',
        'nineam': '09:00',
        'tenam': '10:00',
        'elevenam': '11:00',
        'midday': '12:00',
        'onepm': '13:00',
        'twopm': '14:00',
        'threepm': '15:00',
        'fourpm': '16:00',
        'fivepm': '17:00',
        'sixpm': '18:00',
        'sevenpm': '19:00',
        'eightpm': '20:00',
        'ninepm': '21:00',
        'tenpm': '22:00',
        'elevenpm': '23:00'
        // Add mappings for other time values as needed
    };

    // Check if the input time is mapped to a specific value
    if (timeMappings.hasOwnProperty(inputTime)) {
        return timeMappings[inputTime];
    }

    // If the input time is not mapped, assume it's in HH:MM format and return as is
    return inputTime;
}



// Route to retrieve feeding information for the logged-in user DOMINIC NGUYEN
app.get('/feeding-information', async (req, res) => {
    const username = req.session.username; // Retrieve username from session

    try {
        // Query the database to retrieve feeding information for the logged-in user
        const result = await pool.query('SELECT * FROM scheduled_feeding_information WHERE username = $1 ORDER BY feeding_time;', [username]);

        const feedingInfo = result.rows; // Retrieve the feeding information

        res.status(200).json(feedingInfo); // Return the feeding information in the response
    } catch (error) {
        console.error('Error retrieving feeding information:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to update scheduled feeding information DOMINIC NGUYEN; requireAuth added by Nathan Davis
app.post('/edit-scheduled-feeding-info', requireAuth, async (req, res) => {
    const { time, amount } = req.body;
    const username = req.session.username; // Retrieve username from session

    console.log('Received scheduled feeding information for editing:', { time, amount, username });

    try {
        // Convert time input to a valid time format for PostgreSQL
        const parsedTime = parseTime(time);

        // Update the scheduled feeding information in the database
        const result = await pool.query('UPDATE scheduled_feeding_information SET amount = $1 WHERE username = $2 AND feeding_time = $3 RETURNING *', [amount, username, parsedTime]);

        const updatedInfo = result.rows[0]; // Retrieve the updated scheduled feeding information

        console.log('Updated scheduled feeding information:', updatedInfo);

        res.status(200).json({ message: 'Scheduled feeding information updated successfully', updatedInfo }); // Return the updated scheduled feeding information in the response
    } catch (error) {
        console.error('Error updating scheduled feeding information:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

let scheduledFeedingInterval;
let isMachinePaused = false; // Flag to track machine pause state

// Function to check and trigger scheduled feeding DOMINIC NGUYEN
async function checkScheduledFeeding() {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    try {
        const result = await pool.query('SELECT * FROM scheduled_feeding_information WHERE feeding_time = $1', [currentTime]);
        const feedingInfo = result.rows;
        // console.log(isMachinePaused); Used this log statement solely for testing purposes. As it runs, shows boolean value once every second.
        if (!isMachinePaused && feedingInfo.length > 0) { // Check if the machine is not paused
            const info = feedingInfo[0];
            const dataToSend = { id: info.id, fed: true, amount: info.amount, username: info.username };
            console.log('Data being sent to client:', dataToSend);

            // Broadcast the new feeding information to all connected clients
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(dataToSend));
                }
            });
        }
    } catch (error) {
        console.error('Error checking scheduled feeding:', error);
    }
}

// Run checkScheduledFeeding once
checkScheduledFeeding();

// Run checkScheduledFeeding every second
setInterval(checkScheduledFeeding, 1000);

// Route to pause scheduled feeding checks DOMINIC NGUYEN; requiredAuth added by Nathan Davis
app.post('/pause-machine', requireAuth, async (req, res) => {
    console.log('Pause machine route called');
    clearInterval(scheduledFeedingInterval); // Stop the interval
    isMachinePaused = true; // Set machine pause flag
    res.status(200).json({ message: 'Machine paused successfully' });
});

// Route to start scheduled feeding checks DOMINIC NGUYEN; requireAuth added by Nathan Davis
app.post('/start-machine', requireAuth, async (req, res) => {
    console.log('Start machine route called');
    isMachinePaused = false; // Reset machine pause flag
    checkScheduledFeeding(); // Run immediately
    scheduledFeedingInterval = setInterval(checkScheduledFeeding, 1000); // Run every second
    res.status(200).json({ message: 'Machine started successfully' });
});


// Route to delete a schedule line
app.delete('/delete-schedule-line/:username/:time', requireAuth, async (req, res) => {
    const username = req.params.username; // Retrieve username from URL parameter
    const time = req.params.time; // Retrieve time from URL parameter

    console.log('Received request to delete schedule line:', { username, time });

    try {
        // Delete the schedule line from the database
        const result = await pool.query('DELETE FROM scheduled_feeding_information WHERE username = $1 AND feeding_time = $2 RETURNING *', [username, time]);

        if (result.rowCount > 0) {
            console.log('Schedule line deleted successfully');
            res.status(200).json({ message: 'Schedule line deleted successfully' });
        } else {
            console.error('Failed to delete schedule line');
            res.status(404).json({ message: 'Schedule line not found' });
        }
    } catch (error) {
        console.error('Error deleting schedule line:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DOMINIC NGUYEN
const port = 443;
httpsServer.listen(port, () => {
    console.log(`Server is running on https://www.jmuautofeeder.com on port:${port}`);
});

// WebSocket message handler for client
// Import necessary modules
const base64ToImage = require('base64-to-image');


let food_level = 'Empty';

// WebSocket connection event handler
wss.on('connection', function connection(ws) {
    // WebSocket message handler for client messages
    ws.on('message', async function incoming(data) {
        // Log the raw received data for debugging
        console.log('Raw message from client:', data);

        // Parse the received message as a JSON object
        let message;
        try {
            message = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
        }

        console.log('Received message from client:', message);

        // Check if the message contains the image data and username
        if (message.username && message.image_data) {
            const { username, image_data } = message;
            // Call the function to store image in database
            storeImageInDatabase(username, image_data);
        } else {
            console.error('Received message does not contain image data or username:', message);
        }

        // Check if the message contains the 'success' field
        if ('success' in message && message.success === true) {
            console.log('Updating fed value for id:', [message.id]);
            try {
                // Update fed value in the feeding_information table
                await pool.query('UPDATE feeding_information SET fed = true WHERE id = $1;', [message.id]);
                console.log('Fed value updated successfully.');
            } catch (error) {
                console.error('Error updating fed value:', error);
            }
        }

        //Makes sure the message is not a success message and then override the food_level variable depending on the
        //Function to show message status. WRITTEN BY JT COLEMAN
        if (!('success' in message)) {
            if ('status' in message && message.status === 'low' || 'status' in message && message.status === 'empty') {
                console.log('Food levels low in container');
                        food_level = message.status;
                // send alert to front end to notify user of food level
                // res.status(200).json({message:"Food levels in the container are low"});
                // res.status(200).json({ message: alertMessage, status: 'low' });
            } else {
                console.log('Food levels are Good');
                        food_level = 'Good';
                // res.status(401).json({message:"Food levels in the container are good"});
                // res.status(200).json({ message: alertMessage, status: 'good' });
            }
        }
    }); // End of ws.on('message', ...)
});

// Function to send food level to front end JT COLEMAN
app.get('/food_level', (req, res) =>  {
        res.status(200).send({message: 'The current food level of the feeder is: ', food_level});
    //res.status(200).send({fl: food_level});
});

// Function to decode Base64 image data and store it in PostgreSQL DOMINIC NGUYEN
function storeImageInDatabase(username, image_data) {
    try {
        // Decode Base64 image data
        const decodedImage = Buffer.from(image_data, 'base64');

        // Insert image data into the database
        const query = {
            text: 'INSERT INTO userimages (username, capture_datetime, image) VALUES ($1, $2, $3);',
            values: [username, new Date(), decodedImage],
        };

        // Log the SQL query for debugging
        console.log('SQL Query:', query);

        // Use the existing pool to execute the query
        pool.query(query, (err, result) => {
            if (err) {
                console.error('Error storing image in the database:', err);
            } else {
                console.log('Image stored successfully in the database.');
            }
        });
    } catch (error) {
        console.error('Error decoding or storing image:', error);
    }
}

// Endpoint to handle fetching the most recent image for the logged-in user DOMNIIC NGUYEN
app.get('/get-most-recent-image', (req, res) => {
    // Get the username of the logged-in user from the session
    const username = req.session.username; // Assuming the session variable is named 'username'

    // Query to select the most recent image for the logged-in user
    const sql = `
        SELECT image
        FROM userimages
        WHERE username = $1
        ORDER BY capture_datetime DESC
        LIMIT 1
    `;

    // Execute the query
    pool.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Error fetching most recent image:', error);
            return res.status(500).send('Internal Server Error');
        }

        // Check if any results were returned
        if (results.rows.length === 0) {
            return res.status(404).send('Image not found');
        }

        // Get the image data from the query results
        const imageData = results.rows[0].image;

        // Set the appropriate content type in the response headers
        res.setHeader('Content-Type', 'application/octet-stream');

        // Send the image data as the response
        res.send(imageData);
    });
});
