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

                // Display welcome message in the center of the screen
                // document.getElementById('welcome-message').style.display = 'flex';
                // document.getElementById('firstName').appendChild('${username}!`)

                // const centralContainer = document.createElement('div');
                // centralContainer.classList.add('central-container');
                // const welcomeMessage = document.createElement('span');
                // welcomeMessage.textContent = `Welcome, ${username}!`;
                // centralContainer.appendChild(welcomeMessage);
                // document.body.appendChild(centralContainer);

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
        // document.querySelector('.welcome-message').style.display = 'block';
        // document.querySelector('.welcome-message span').textContent = username;
    } else {
        // User is not logged in
        document.getElementById('cards').style.display = 'none';
        document.querySelector('.welcome-message').style.display = 'none';
    }
}

// call checkSession to check for an existing session when page loads
document.addEventListener('DOMContentLoaded', checkSession);
