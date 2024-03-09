//Script Owned by Dominic Nguyen
//Full Code Developed and Modified by Dominic Nguyen
//Handles API Connections, Connection to Database, etc.
//CURRENT verison used
//Modified on 02/24/2024 to allow HTTPS connection
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const https = require('https');
const fs = require('fs');



const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: 'ubuntu',
  host: 'localhost',
  database: 'AutoFeeder',
  password: 'checkout',
  port: 5432,
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM login WHERE username = $1 AND password_hash = crypt($2, password_hash)', [username, password]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

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

// Serve static files from the root directory
app.use(express.static('/home/ubuntu/Autofeeder'));

// Route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});



// Load SSL certificate and key
const privateKey = fs.readFileSync('/etc/letsencrypt/live/www.jmuautofeeder.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/www.jmuautofeeder.com/fullchain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);


// Import required libraries
const jwt = require('jsonwebtoken');

// Function to generate JWT token
function generateAuthToken(username) {
    // Generate a JWT token with the username as the payload
    return jwt.sign({ username }, 'Test44', { expiresIn: '1h' }); // Change 'your_secret_key' to a secret key of your choice
}

// Route to handle user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verify username and password
        const result = await pool.query('SELECT * FROM login WHERE username = $1 AND password_hash = crypt($2, password_hash)', [username, password]);
        if (result.rows.length > 0) {
            // Generate authentication token
            const authToken = generateAuthToken(username);
            // Return token to client
            res.status(200).json({ authToken });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to verify authentication token
function verifyAuthToken(req, res, next) {
    const authToken = req.headers['authorization'];
    if (!authToken) return res.status(401).json({ message: 'Authorization token not provided' });

    // Verify token
    jwt.verify(authToken, 'Test44', (err, decoded) => { // Change 'your_secret_key' to your secret key
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        req.username = decoded.username;
        next();
    });
}

// Route to update feeding information (protected with authentication)
app.post('/update-feeding-info', verifyAuthToken, async (req, res) => {
    const { fed, amount } = req.body;
    const username = req.username;
    try {
        // Insert feeding information into the database
        await pool.query('INSERT INTO feeding_information (username, fed, amount) VALUES ($1, $2, $3)', [username, fed, amount]);
        res.status(200).json({ message: 'Feeding information updated successfully' });
    } catch (error) {
        console.error('Error updating feeding information:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const port = 443;
httpsServer.listen(port, () => {
    console.log(`Server is running on https://www.jmuautofeeder.com on port:${port}`);
});

ubuntu@ip-172-31-2-253:~/Autofeeder$ sudo node server_side.js
Server is running on https://www.jmuautofeeder.com on port:443
^C
ubuntu@ip-172-31-2-253:~/Autofeeder$ ls
 Camera.html                   Home.html   feeding.html   machinestatus.html   package-lock.json   popups.css       serverside.js   style.css
'Cat walking silhouette.png'   backup      files          node_modules         package.json        server_side.js   siteScript.js   updated_server.js
ubuntu@ip-172-31-2-253:~/Autofeeder$ cat serverside.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: 'ubuntu',
  host: 'localhost',
  database: 'AutoFeeder',
  password: 'checkout',
  port: 5432,
});

// Serve static files from the root directory
app.use(express.static('/home/ubuntu/Autofeeder'));

// Route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});

// Load SSL certificate and key
const privateKey = fs.readFileSync('/etc/letsencrypt/live/www.jmuautofeeder.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/www.jmuautofeeder.com/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Function to generate JWT token
function generateAuthToken(username) {
    return jwt.sign({ username }, 'Test44', { expiresIn: '1h' });
}

// Route to handle user login and generate authentication token
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verify username and password
        const result = await pool.query('SELECT * FROM login WHERE username = $1 AND password_hash = crypt($2, password_hash)', [username, password]);
        if (result.rows.length > 0) {
            // Generate authentication token
            const authToken = generateAuthToken(username);
            // Return token to client
            res.status(200).json({ authToken });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to verify authentication token
function verifyAuthToken(req, res, next) {
    const authToken = req.headers['authorization'];
    if (!authToken) return res.status(401).json({ message: 'Authorization token not provided' });

    // Verify token
    jwt.verify(authToken, 'Test44', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        req.username = decoded.username;
        next();
    });
}

// Route to update feeding information (protected with authentication)
app.post('/update-feeding-info', verifyAuthToken, async (req, res) => {
    const { fed, amount } = req.body;
    const username = req.username;
    try {
        // Insert feeding information into the database
        await pool.query('INSERT INTO feeding_information (username, fed, amount) VALUES ($1, $2, $3)', [username, fed, amount]);
        res.status(200).json({ message: 'Feeding information updated successfully' });
    } catch (error) {
        console.error('Error updating feeding information:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const port = 443;
httpsServer.listen(port, () => {
    console.log(`Server is running on https://www.jmuautofeeder.com on port:${port}`);
});
