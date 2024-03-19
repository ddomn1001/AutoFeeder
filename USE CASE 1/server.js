//SERVERSIDE CODE WRITTEN COMPLETELY BY DOMINIC NGUYEN
const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
// const session = require('express-session');
const path = require('path');

const app = express();

app.use(bodyParser.json());

// Load SSL certificate and key
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

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// WebSocket server setup
const wss = new WebSocket.Server({ server: httpsServer });
// Serve static files from the root directory
app.use(express.static('/home/ubuntu/Autofeeder'));

// Route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Home.html'));
});

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
// Create account route
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

// Login route
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

// Route to update feeding information
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

const port = 443;
httpsServer.listen(port, () => {
    console.log(`Server is running on https://www.jmuautofeeder.com on port:${port}`);
});
