// Function to open popup
function openPopup(popupId) {
    // Close any open popups
    closeAllPopups();
    // Open the specified popup
    const popup = document.getElementById(popupId);
    popup.style.display = 'block';
}


// Function to close popup
function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.style.display = 'none';
}

// Function to close all popups
function closeAllPopups() {
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        popup.style.display = 'none';
    });
}

// Function to open the create account popup and close the login popup
function openCreateAccountPopup() {
    openPopup('createAccountPopup');
    closePopup('loginPopup');
}

// Function to submit the login form
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
                alert('Login successful!');
                // Show the cards div upon successful login, owned by Nathan Davis
                document.getElementById('cards').style.display = 'flex';

                //sets the session storage; owned by Nathan Davis
                sessionStorage.setItem('username', username);
                // Welcome message owned by Nathan Davis
                // Display welcome message in the nav
                const welcomeMessage = document.createElement('span');
                welcomeMessage.textContent = `Welcome, ${username}!`;
                document.querySelector('.buttons').appendChild(welcomeMessage);

                fetch(`/user/${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                alert('Invalid username or password');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while logging in');
        });

    // Close the login popup
    closePopup('loginPopup');
}

// function to logout; owned by Nathan Davis
function logout() {
    // Clear session
    sessionStorage.removeItem('username');
    // Redirect to the home page
    window.location.href = '/';
}

// Function to submit the create account form
function submitCreateAccountForm() {
    // Get form values
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const email = document.getElementById('email').value;
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;


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
                // You can redirect the user or perform other actions here
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


// function to check for an existing session and display elements based on session; owned by Nathan Davis
function checkSession() {
    const username = sessionStorage.getItem('username');
    if (username) {
        // User is logged in
        document.getElementById('cards').style.display = 'flex';
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

    // Append schedule line to the container
    const scheduleContainer = document.getElementById('schedule-container');
    scheduleContainer.appendChild(scheduleLine);

    // Close the add popup
    closePopup('addPopup');
}

// Function to add event listeners
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('submitButton').addEventListener('click', submitScheduledFeeding);
});

// Function to submit scheduled feeding information to the server DOMINIC NGUYEN
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
        alert('Scheduled feeding information updated successfully!');
    })
    .catch(error => {
        console.error('Error updating scheduled feeding information:', error);
        // Display error message on the frontend
        alert('Error updating scheduled feeding information. Please try again later.');
    });
}

// Function to fetch and display feeding information when the page loads DOMINIC NGUYEN
window.onload = async function() {
    await fetchFeedingInformation(); // Populate the schedule entries
};

// Function to fetch feeding information for the logged-in user DOMINIC NGUYEN
async function fetchFeedingInformation() {
    try {
        const response = await fetch('/feeding-information');
        const data = await response.json();

        // Display the feeding information on the page
        const scheduleContainer = document.getElementById('schedule-container');
        scheduleContainer.innerHTML = ''; // Clear previous content

        data.forEach(item => {
            const feedingTime = item.feeding_time;
            const amount = item.amount;
            const listItem = document.createElement('div');
            listItem.textContent = `Time: ${feedingTime}, Amount: ${amount} ounces`;
            listItem.setAttribute('data-id', item.id);
            listItem.addEventListener('click', () => selectEntry(listItem));
            scheduleContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching feeding information:', error);
    }
}

// Function to open the edit schedule popup
function openEditPopup() {
    openPopup('editPopup');
}

// Function to edit a schedule line DOMINIC NGUYEN
function editScheduleLine() {
    const time = document.getElementById('edit-times').value;
    const amount = document.getElementById('edit-oz').value;

    // Prepare the data to send to the server
    const data = {
        time: time,
        amount: amount
    };

    // Send the data to the server using a POST request DOMINIC NGUYEN
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

//Function to Pause the machine Dominic Nguyen
function pauseMachine() {
    fetch('/pause-machine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Machine paused successfully');
        } else {
            console.error('Failed to pause machine');
        }
    })
    .catch(error => console.error('Error:', error));
}

//Function to Start the machine Dominic Nguyen
function startMachine() {
    fetch('/start-machine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Machine started successfully');
        } else {
            console.error('Failed to start machine');
        }
    })
    .catch(error => console.error('Error:', error));
}
