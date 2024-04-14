const axios = require('axios');

// Server URL
const serverUrl = 'http://44.220.217.210:8080'; //EC2 server

// Function to send data to the server
const sendDataToServer = async (data) => {
    try {
        const response = await axios.post(`${serverUrl}/update-data`, data);
        console.log(response.data.message);
    } catch (error) {
        console.error('Error sending data to server:', error.message);
    }
};

const dataToSend = {};

// Call the function to send data to the server
sendDataToServer(dataToSend);
