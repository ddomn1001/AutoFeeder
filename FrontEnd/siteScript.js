document.addEventListener('DOMContentLoaded', function() {
    const cardsElement = document.getElementById('cards');
    if (cardsElement) {
        cardsElement.style.display = 'flex';
    } else {
        console.error("Element with ID 'cards' not found.");
    }
});

// Make sure to remove any code that directly accesses the 'cards' element before it's fully loaded

// Function to open popup
function openPopup(popupId) {
    closeAllPopups();
    const popup = document.getElementById(popupId);
    popup.classList.add('open'); // Add 'open' class to show popup
    document.getElementById('overlay').style.display = 'block';
}


// Function to close popup
function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('open');
    document.getElementById('overlay').style.display = 'none'
}

// Function to close all popups
/*function closeAllPopups() {
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        popup.classList.remove('open');
    });
    document.getElementById('overlay').style.display = 'none';
}
*/

// Function to close all popups
function closeAllPopups() {
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        popup.classList.remove('open');
    });

    // Retrieve the overlay element
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.style.display = 'none';
    } else {
        console.error("Overlay element not found.");
    }
}

// Function to open the create account popup and close the login popup
function openCreateAccountPopup() {
    openPopup('createAccountPopup');
    closePopup('loginPopup');
    document.getElementById('overlay').style.display = 'block';
}



// WORKING WORKING WORKING
function submitLoginForm() {
    // Get username and password values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send login data to the server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {

            const { first_name, last_name, email } = data;
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('fname', first_name);
            sessionStorage.setItem('lname', last_name);
            sessionStorage.setItem('email', email);

            // Update UI with user information
            const welcomeElement = document.getElementById('home-welcome');
            const userInfoElement = document.getElementById('userInfoText');

            if (welcomeElement && userInfoElement) {
                
                    // Update welcome message
                    welcomeElement.innerHTML = `Welcome, ${username}! Please click one of the buttons below!`;

                    // Use flexbox to display user information in a column
                    userInfoElement.style.display = 'flex';
                    userInfoElement.style.flexDirection = 'column';

                    // Update user information
                    userInfoElement.innerHTML = `
                    <div>Username: ${username}</div>
                    <div>First Name: ${first_name}</div>
                    <div>Last Name: ${last_name}</div>
                    <div>Email: ${email}</div>
                `;
            } else {
                console.error("One or more required elements not found.");
            }

            // Show the cards div upon successful login
            document.getElementById('cards').style.display = 'flex';

            // Set session storage
            sessionStorage.setItem('username', username);

            // Change visibility of login button to none, set account button in its place
            document.getElementById('login').style.display = 'none';
            document.getElementById('account').style.display = 'flex';

            // Close the login popup
            closePopup('loginPopup');
        } else {
            alert('Invalid username or password');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while logging in');
    });
}




// Handle login form submission (both traditional and OAuth login)
/*function submitLoginForm() {
    // Get username and password values
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send login data to the server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            handleLoginSuccess(data);
        } else {
            alert('Invalid username or password');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while logging in');
    });
}
*/
// Handle actions after successful login (both traditional and OAuth login)
/*function handleLoginSuccess(data) {
    const { username, first_name, last_name, email } = data;
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('fname', first_name);
    sessionStorage.setItem('lname', last_name);
    sessionStorage.setItem('email', email);

    // Update UI with user information
    const welcomeElement = document.getElementById('home-welcome');
    const userInfoElement = document.getElementById('userInfoText');

    if (welcomeElement && userInfoElement) {
        // Update welcome message
        welcomeElement.innerHTML = `Welcome, ${username}! Please click one of the buttons below!`;

        // Use flexbox to display user information in a column
        userInfoElement.style.display = 'flex';
        userInfoElement.style.flexDirection = 'column';

        // Update user information
        userInfoElement.innerHTML = `
            <div>Username: ${username}</div>
            <div>First Name: ${first_name}</div>
            <div>Last Name: ${last_name}</div>
            <div>Email: ${email}</div>
        `;
    } else {
        console.error("One or more required elements not found.");
    }

    // Show the cards div upon successful login
    document.getElementById('cards').style.display = 'flex';

    // Set session storage
    sessionStorage.setItem('username', username);

    // Change visibility of login button to none, set account button in its place
    document.getElementById('login').style.display = 'none';
    document.getElementById('account').style.display = 'flex';

    // Close the login popup
    closePopup('loginPopup');
}
*/
// Handle Google OAuth login
/*document.getElementById('google-login').addEventListener('click', () => {
    // Redirect the user to the Google OAuth authorization endpoint
    window.location.href = '/auth/google';
});
*/

// function to logout; owned by Nathan Davis
function logout() {
    // Clear session
    sessionStorage.removeItem('username');
    // Redirect to the home page
    window.location.href = '/';
}

function submitCreateAccountForm() {

    // Get form values
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const email = document.getElementById('email').value;
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9!@#$%^&*()_+|~\-=`{}[\]:";'<>?,./]).{7,}$/;
    if (!passwordRegex.test(newPassword)) {
        alert('Password must contain at least one capital letter, one number or special character, and be at least 7 characters long');
        return;
    }

    sessionStorage.setItem('fname', fname);
    sessionStorage.setItem('lname', lname);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('username', newUsername);
    sessionStorage.setItem('password', newPassword);

    // Send create account data to the server
    fetch('/create-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({fname, lname, email, newUsername, newPassword })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Account created successfully') {
                alert('Account created successfully!');
            } else {
                alert('An error occurred while creating the account');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while creating the account');
        });

    // Close the create account popup
    closePopup('createAccountPopup');
}


//This part of the Script was Written by DOMINIC NGUYEN and Tim Hudson

// Function to submit feeding information
/*
function submitFeeding(event) {
    event.preventDefault();
    const amount = document.getElementById("amount").value;
    fetch('/update-feeding-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fed: false, amount: amount })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Feeding information updated successfully:', data.message);
            // Display success message on the frontend
            setTimeout(() => { alert('Feeding information updated successfully!'); }, 2000);
            // alert('Feeding information updated successfully!');
        })
        .catch(error => {
            console.error('Error updating feeding information:', error);
            // Display error message on the frontend
            alert('Error updating feeding information. Please try again later.');
        });
}

*/
// Function to submit feeding information
function submitFeeding(event) {
    event.preventDefault();
    const amount = document.getElementById("amount").value;
    fetch('/update-feeding-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fed: false, amount: amount })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Feeding information updated successfully:', data.message);
            setTimeout(fetchFoodLevel, 1000);
            closePopup('onDemandPopup');
        })
        .catch(error => {
            console.error('Error updating feeding information:', error);
            // Display error message on the frontend
            alert('Error updating feeding information. Please try again later.');
        });
}



// Function to check for an existing session and display elements based on session; owned by Nathan Davis
function checkSession() {
    const username = sessionStorage.getItem('username');
    const fname = sessionStorage.getItem('fname');
    const lname = sessionStorage.getItem('lname');
    const email = sessionStorage.getItem('email');

    if (username) {
        // User is logged in
        const welcomeMessage = document.createElement('span');
        welcomeMessage.textContent = `Welcome, ${username}! Please click one of the buttons below!`;
        document.getElementById('home-welcome').innerHTML = '';
        document.getElementById('home-welcome').appendChild(welcomeMessage);

        const userInfoElement = document.getElementById('userInfoText');
        if (userInfoElement) {

            // Update user information
            userInfoElement.innerHTML = `
                <div>Username: ${username}</div>
                <div>First Name: ${fname}</div>
                <div>Last Name: ${lname}</div>
                <div>Email: ${email}</div>
            `;
        } else {
            console.error("User information element not found.");
        }

        // Show the cards div upon successful login, owned by Nathan Davis
        document.getElementById('cards').style.display = 'flex';

        //sets the session storage; owned by Nathan Davis
        sessionStorage.setItem('username', username);

        // changes visibility of login button to none, sets account button in its place
        document.getElementById('login').style.display = 'none';
        document.getElementById('account').style.display = 'flex';

    } else {
        // User is not logged in
        document.getElementById('cards').style.display = 'none';
    }
}

// call checkSession to check for an existing session when page loads; owbed by Nathan Davis
document.addEventListener('DOMContentLoaded', checkSession);



// Feeding schedule that add and edit current schedule; owned by Nathan Davis
// Function to add event listeners
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('add').addEventListener('click', openAddPopup);
    document.getElementById('edit').addEventListener('click', openEditPopup);
});

// Function to open the add schedule popup
function openAddPopup() {
    openPopup('addPopup');
}

// Function to open the edit schedule popup
function openEditPopup() {
    openPopup('editPopup');
}

// Function to add a new schedule line
function addScheduleLine() {
    const time = document.getElementById('times').value;
    const ounces = document.getElementById('amount').value;

    // Create new schedule line HTML
    const scheduleLine = document.createElement('div');
    scheduleLine.classList.add('schedule-line');
    scheduleLine.dataset.time = time;
    scheduleLine.dataset.ounces = ounces;
    scheduleLine.innerHTML = `<p>Time: ${time}, Ounces: ${ounces}</p>`;

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.onclick = function() {
        openDeletePopup(scheduleLine);
    };

    // Append delete button to schedule line
    scheduleLine.appendChild(deleteButton);

    // Append schedule line to the container
    const scheduleContainer = document.getElementById('schedule-container');
    scheduleContainer.appendChild(scheduleLine);

    // Close the add popup
    closePopup('addPopup');
}

// Function to open the delete confirmation popup
function openDeletePopup(scheduleLine) {
    // Store the schedule line element to delete
    window.selectedScheduleLine = scheduleLine;
    // Open the delete popup
    openPopup('deletePopup');
}


// Function to add event listeners
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submitButton').addEventListener('click', submitScheduledFeeding);
});

// Function to submit scheduled feeding information to the server
function submitScheduledFeeding(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the time and amount values from the form
    const time = document.getElementById("times").value;
    const amount = document.getElementById("amount").value;

    // Prepare the data to send to the server
    const data = {
        time: time,
        amount: amount
    };

    // Send the data to the server using a POST request
    fetch('/update-scheduled-feeding-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log('Scheduled feeding information updated successfully:', data);
        // Display success message on the frontend
        location.reload();
    })
    .catch(error => {
        console.error('Error updating scheduled feeding information:', error);
        // Display error message on the frontend
        alert('Error updating scheduled feeding information. Please try again later.');
    });
}

// Function to fetch and display feeding information when the page loads
window.onload = async function() {
    await fetchFeedingInformation(); // Populate the schedule entries
};

// Function to fetch feeding information for the logged-in user
async function fetchFeedingInformation() {
    try {
        const response = await fetch('/feeding-information');
        const data = await response.json();
	    const username = sessionStorage.getItem('username');
        // Display the feeding information on the page
        const tableContainer = document.getElementById('scheduleTable');
        const table = document.createElement('table');
        table.classList.add('schedule-table');
	// Create table title
        const titleRow = document.createElement('tr');
        const titleCell = document.createElement('th');
        titleCell.textContent = 'Feeding Schedule for: ' + username;
        titleCell.colSpan = 3; // Span across all columns
        titleCell.classList.add('title-cell');
        titleRow.appendChild(titleCell);
        table.appendChild(titleRow);

        // Create table header
        const headerRow = document.createElement('tr');
        const headers = ['Time', 'Amount (ounces)', 'Delete?'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);
        

        data.forEach(item => {
            const feedingTime = item.feeding_time;
            const amount = item.amount;
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            const amountCell = document.createElement('td');
            const deleteCell = document.createElement('td');
            const deleteIcon = document.createElement('span');
            deleteIcon.textContent = '❌';
            deleteIcon.classList.add('delete-icon');
            // Event listener for delete function - WRITTEN BY ERIC YATES
            deleteIcon.addEventListener('click', async function() {
                try {
                    // Send a request to delete the schedule line from the database
                    const response = await fetch(`/delete-schedule-line/${username}/${feedingTime}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // If deletion from the database is successful, remove the row from the frontend
                    if (response.ok) {
                        row.remove();
                    } else {
                        console.error('Failed to delete schedule line from the database');
                    }
                } catch (error) {
                    console.error('Error deleting schedule line:', error);
                }
            });
            timeCell.textContent = feedingTime;
            amountCell.textContent = amount;
            deleteCell.appendChild(deleteIcon);
            row.appendChild(timeCell);
            row.appendChild(amountCell);
            row.appendChild(deleteCell);
            table.appendChild(row);
        });

        tableContainer.appendChild(table)
    } catch (error) {
        console.error('Error fetching feeding information:', error);
    }
}

// Function to open the edit schedule popup
function openEditPopup() {
    openPopup('editPopup');
}

// Function to edit a schedule line
function editScheduleLine() {
    const time = document.getElementById('edit-times').value;
    const amount = document.getElementById('edit-oz').value;

    // Prepare the data to send to the server
    const data = {
        time: time,
        amount: amount
    };

    // Send the data to the server using a POST request
    fetch('/edit-scheduled-feeding-info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log('Scheduled feeding information updated successfully:', data);
        // Display success message on the frontend
        alert('Scheduled feeding information updated successfully!');
    })
    .catch(error => {
        console.error('Error updating scheduled feeding information:', error);
        // Display error message on the frontend
        alert('Error updating scheduled feeding information. Please try again later.');
    });
}
// JavaScript function to create alert when button is clicked
function createAlert() {
    alert("Feature still being developed");
}

// Function to save status message to sessionStorage
function saveStatusMessage(message) {
    sessionStorage.setItem('lastStatusMessage', message);
}

// Function to retrieve and display last status message from sessionStorage
function displayLastStatusMessage() {
    const lastStatusMessage = sessionStorage.getItem('lastStatusMessage');
    const machineStatus = document.getElementById('machine-status-box');
    if (lastStatusMessage) {
        const statusMessage = document.createElement('span');
        statusMessage.textContent = lastStatusMessage;
        machineStatus.innerHTML = ''; // Clear existing message
        machineStatus.appendChild(statusMessage);
    }
}

// Call the displayLastStatusMessage function when the page loads
window.addEventListener('load', displayLastStatusMessage);

//Function to Pause the machine Dominic Nguyen
function pauseMachine() {
    const username = sessionStorage.getItem('username');
    const machineStatus = document.getElementById('machine-status-box');


    fetch('/pause-machine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Machine paused successfully');
            const statusMessage = document.createElement('span');
            statusMessage.textContent = `Welcome, ${username}. Your feeder is currently inactive`;
            machineStatus.innerHTML = ''; // Clear existing message
            machineStatus.appendChild(statusMessage);
            saveStatusMessage(statusMessage.textContent);
        } else {
            console.error('Failed to pause machine');
            alert('Failed to puase machine');
        }
    })
    .catch(error => console.error('Error:', error));
}

//Function to Start the machine Dominic Nguyen
function startMachine() {
    const username = sessionStorage.getItem('username');
    const machineStatus = document.getElementById('machine-status-box');


    fetch('/start-machine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Start machine route called');
            const statusMessage = document.createElement('span');
            statusMessage.textContent = `Welcome, ${username}. Your feeder is currently active`;
            machineStatus.innerHTML = '';
            machineStatus.appendChild(statusMessage);
            saveStatusMessage(statusMessage.textContent);
        } else {
            console.error('Failed to start machine');
            alert('Failed to start the machine');
        }
    })
    .catch(error => console.error('Error:', error));
}




// Assuming you have a reference to the table
const table = document.getElementById('feeding-schedule-table'); // Update with the actual ID of your table

// Attach event listener to the table
table.addEventListener('click', function(event) {
    // Check if the clicked element is the delete button
    if (event.target.classList.contains('delete-button')) {
        // Retrieve the username and time from the row
        const username = event.target.dataset.username;
        const time = event.target.dataset.time;

        // Call the deleteScheduleLine function
        deleteScheduleLine(username, time);
    }
});
// Written by Eric, Dom helped
// Function to handle deletion of a schedule line
function deleteScheduleLine(username, time) {
    // Send a request to delete the schedule line from the database
    fetch(`/delete-schedule-line/${username}/${time}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        // If deletion from the database is successful, remove the schedule line from the frontend
        .then(response => {
            if (response.ok) {
                // Remove the row from the table
                const row = document.querySelector(`#feeding-schedule-table tr[data-username="${username}"][data-time="${time}"]`);
                if (row) {
                    row.remove();
                }
            } else {
                console.error('Failed to delete schedule line from the database');
            }
        })
        .catch(error => {
            console.error('Error deleting schedule line:', error);
        });
}


// Written by Eric
async function fetchMostRecentDecryptedImage(username) {
    try {
        // Make a request to the server to fetch the most recent decrypted image for the username
        const response = await fetch(`/get-most-recent-decrypted-image?username=${username}`);

        if (response.ok) {
            // Convert the response to blob (image data)
            const imageData = await response.blob();
            const imageUrl = URL.createObjectURL(imageData);

            // Display the image on the webpage
            const imageHtml = `<img src="${imageUrl}" alt="Decrypted Image">`;
            document.getElementById('imageContainer').innerHTML = imageHtml;

            updateUsername();
        } else {
            console.error('Failed to fetch most recent decrypted image:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching most recent decrypted image:', error);
    }
}




/*
function updateSensor() {
    fetch('/food-levels')
        .then(response => response.json())
        .then(data => {
            // Update the sensor box text based on the response
            var sensorText = document.getElementById('sensor');
            sensorText.textContent = data.message;
            // You can also handle additional styling here if needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
*/

// Function to update the <h2> element with the current signed-in user
function updateUsername() {
    // Fetch the username from sessionStorage
    const username = sessionStorage.getItem('username');
    console.log('updating username', username)
    // Get the <h2> element
    const imageUserElement = document.getElementById('imageUser');
    // Update the text content with the username
    if (username && imageUserElement) {
        imageUserElement.textContent = `Welcome, ${username}!`; // Update the text content
    }
}
/*
// Function to fetch log messages from the server
async function fetchLogMessages() {
    try {
        const response = await fetch('/food_level');
        if (response.ok) {
            const logMessage = await response.text();
            console.log('Received log message from server:', logMessage);
            // Display the log message on the web page if needed
            alert("THIS WORKED");
            const sensorText = document.getElementById('sensor');
            sensorText.textContent = 'WOOHOO';
        } else {
            console.error('Failed to fetch log message:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching log message:', error);
    }
}
*/
 /*
// Function to fetch food level from the server
async function fetchFoodLevel() {
    try {
        const response = await fetch('/food_level');
        if (response.ok) {
            const data = await response.json();
            console.log('Received food level from server:', data);
            // Extract message and food level from the response
            const message = data.message;
            const foodLevel = data.food_level;
            // Now you can use message and foodLevel as needed
            console.log('Message:', message);
            console.log('Food Level:', foodLevel);
        } else {
            console.error('Failed to fetch food level:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching food level:', error);
    }
}
*/

// Function to fetch food level from the server
async function fetchFoodLevel() {
    try {
        const response = await fetch('/food_level');
        if (response.ok) {
            const data = await response.json();
            const message = data.message;
            const foodLevel = data.food_level;
            console.log('Received food level from server:', message, foodLevel);
            // Update the UI with the received message and food level
            updateFoodLevel(message, foodLevel);
            // Store the message and food level in local storage
            localStorage.setItem('sensorMessage', message);
            localStorage.setItem('foodLevel', foodLevel);
        } else {
            console.error('Failed to fetch food level:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching food level:', error);
    }
}


// Function to update the UI with the received food level
function updateFoodLevel(message, foodLevel) {
    const sensorBox = document.getElementById('sensorBox');
    const sensorText = document.getElementById('sensor');
    sensorText.textContent = `${message} ${foodLevel}`;
}





