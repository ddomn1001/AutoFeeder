//SERVERSIDE CODE 
const express = require('express');
const http = require('http'); 
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const path = require('path');

const app = express();
const server = http.createServer(app); 

app.use(bodyParser.json());
app.use(express.static('/home/ubuntu/Autofeeder'));

// Route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Home.html'));
});

// Session middleware setup
app.use(session({
    secret: 'fn889bkh',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// WebSocket server setup
const wss = new WebSocket.Server({ server }); 

// Initialize PostgreSQL Pool
const pool = new Pool({
    user: 'ubuntu',
    host: 'localhost',
    database: 'AutoFeeder',
    password: 'checkout',
    port: 5432,
});

// Function to generate JWT token
function generateAuthToken(username) {
    return jwt.sign({ username }, 'c8hhdj992');
}

// Session middleware setup; owned my Nathan Davis
const session = require('express-session');
app.use(session({
    secret: 'fn889bkh',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

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

// Login route DOMINIC NGUYEN
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM login WHERE username = $1 AND password_hash = crypt($2, password_hash)', [username, password]);
        if (result.rows.length > 0) {
            // Store user data in session upon successful login
            req.session.username = username;
            const authToken = generateAuthToken(username);
            res.status(200).json({ message: 'Login successful', authToken, username });
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
    if (req.session.userId) {
        next(); // User is authenticated, continue to next middleware
    } else {
        res.redirect('Home.html'); // User is not authenticated, redirect to login page
    }
}

// Route to update feeding information DOMINIC NGUYEN
app.post('/update-feeding-info', async (req, res) => {
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



// Route to update scheduled feeding information DOMINIC NGUYEN
app.post('/update-scheduled-feeding-info', async (req, res) => {
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
        const result = await pool.query('SELECT * FROM scheduled_feeding_information WHERE username = $1', [username]);

        const feedingInfo = result.rows; // Retrieve the feeding information

        res.status(200).json(feedingInfo); // Return the feeding information in the response
    } catch (error) {
        console.error('Error retrieving feeding information:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

 
// Route to update scheduled feeding information DOMINIC NGUYEN
app.post('/edit-scheduled-feeding-info', async (req, res) => {
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

// Function to check and trigger scheduled feeding DOMINIC NGUYEN
async function checkScheduledFeeding() {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    try {
        const result = await pool.query('SELECT * FROM scheduled_feeding_information WHERE feeding_time = $1', [currentTime]);
        const feedingInfo = result.rows;

        if (feedingInfo.length > 0) {
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

// WebSocket connection event handler
wss.on('connection', function connection(ws) {
    // WebSocket message handler for client success notification
    ws.on('message', async function incoming(data) {
        // Parse the received message as a JSON object
        const message = JSON.parse(data);
        console.log('Received message from client:', message);

        // Check if the message contains the 'success' field
        if ('success' in message && message.success === true) {
            console.log('Updating fed value for id:',[message.id]);
            try {
                // Update fed value in the feeding_information table
                await pool.query('UPDATE feeding_information SET fed = true WHERE id = $1;', [message.id]);
                console.log('Fed value updated successfully');
            } catch (error) {
                console.error('Error updating fed value:', error);
            }
        }
    });
});

// Define HTTP port
const port = 80;

// Start the HTTP server
server.listen(port, () => {
    console.log(`Server is running on http://www.jmuautofeeder.com on port:${port}`);
});
