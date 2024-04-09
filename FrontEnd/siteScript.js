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
function closeAllPopups() {
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => {
        popup.classList.remove('open');
    });
    document.getElementById('overlay').style.display = 'none';
}

// Function to open the create account popup and close the login popup
function openCreateAccountPopup() {
    openPopup('createAccountPopup');
    closePopup('loginPopup');
    document.getElementById('overlay').style.display = 'block';
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




		    	const fname = sessionStorage.getItem('fname', data.fname);
                const lname = sessionStorage.getItem('lname', data.lname);
                const email = sessionStorage.getItem('email', data.email);
		        const welcomeMessage = document.createElement('span');
                welcomeMessage.textContent = `Welcome, ${username}! Please click one of the buttons below!`;
           	    document.getElementById('home-welcome').innerHTML = '';
		        document.getElementById('home-welcome').appendChild(welcomeMessage);
		        const accountMessage = document.createElement('span');
                accountMessage.textContent = `Username: ${username} First Name: ${fname} Last Name: ${lname} Email: ${email}`;
		        document.getElementById('userInfoText').innerHTML = '';
		        document.getElementById('userInfoText').appendChild(accountMessage);


                // Show the cards div upon successful login, owned by Nathan Davis
                document.getElementById('cards').style.display = 'flex';

                //sets the session storage; owned by Nathan Davis
                sessionStorage.setItem('username', username);


                // changes visibility of login button to none, sets account button in its place
                document.getElementById('login').style.display = 'none';
                document.getElementById('account').style.display = 'flex';



                fetch(`/user/${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(userData => {

                        closePopup('loginPopup');
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

/*
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
*/

/*
 function updateAccountPopup(userData) {
   const accountPopup = document.getElementById('accountPopup');
    const userInfoParagraph = accountPopup.querySelector('.userInfo');
	const fname = document.getElementById('fname.value)';
   userInfoParagraph.textContent = `Username: ${loginInfo.username}, First Name: ${fname}, Last Name: ${lname}, Email: ${email}`;
}
*/

        

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
        const welcomeMessage = document.createElement('span');
        welcomeMessage.textContent = `Welcome, ${username}! Please click one of the buttons below!`;
        document.getElementById('home-welcome').innerHTML = '';
        document.getElementById('home-welcome').appendChild(welcomeMessage);
        const accountMessage = document.createElement('span');
        accountMessage.textContent = `Username: ${username} First Name: ${fname} Last Name: ${lname} Email: ${email}`;
        document.getElementById('userInfoText').innerHTML = '';
        document.getElementById('userInfoText').appendChild(accountMessage);


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

// Function to submit scheduled feeding information to the server
/*function submitScheduledFeeding(event) {
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
}*/

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

/*
// Function to fetch feeding information for the logged-in user
async function fetchFeedingInformation() {
    try {
        // Check if username is available
        const username = sessionStorage.getItem('username');
        if (!username) {
            console.error('Error: Username not found in session storage');
            return;
        }

        // Fetch feeding information
        const response = await fetch('/feeding-information');
        if (!response.ok) {
            console.error('Error: Failed to fetch feeding information. Status:', response.status);
            return;
        }

        const data = await response.json();

        // Display the feeding information on the page
        const tableContainer = document.getElementById('scheduleTable');
        if (!tableContainer) {
            console.error('Error: Table container with ID "scheduleTable" not found');
            return;
        }

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
            deleteIcon.addEventListener('click', function() {
                // Handle the click event for the delete icon
                // For example, you can remove the row from the table
                row.remove();
            });
            timeCell.textContent = feedingTime;
            amountCell.textContent = amount;
            deleteCell.appendChild(deleteIcon);
            row.appendChild(timeCell);
            row.appendChild(amountCell);
            row.appendChild(deleteCell);
            table.appendChild(row);
        });

        tableContainer.appendChild(table);
    } catch (error) {
        console.error('Error fetching feeding information:', error);
    }
}
*/
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

// Adding event listener to the button

// document.getElementById("wipButton").addEventListener("click", createAlert);






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
            const statusMessage = document.createElement('span');
            stautsMessage.textContent = `Welcome, ${username} Your Machine is currently Pause`;


            document.getElementById('status').innerHTML = '';
            document.getElementById('status').appendChild(welcomeMessage);
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

/*Alert Function that does nbot require user input - Tim Hudson
function showAlert(message, duration) {
	var alertBox = document.getElementById('alert');
	alertBox.textContent = message;
	alertBox.style.display = 'block';
	setTimeout(function()){
		alertBox.style.display = 'none';
	}, duration);
}*/



/*
const ws = new Websocket('wss://www.jmuautofeeder.com');
const cameraFeed = document.getElementByID('cameraFeed');
ws.onmessage = function(event) {
        const data = event.data;
        if (data instanceof Blob) {
                const blob = new Blob([data], {type:'video/mp4'});
                const url = URL.createObjectURL(blob);
                cameraFeed.src = url;
        }

}
function openCameraPopup() {
	openPopup('cameraPopup');
	startCameraFeed();
}

function closeCameraPopup() {
	closePopup('cameraPopup');
}
function startCameraFeed() {
}

*/


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

function displayUserInfo() {
    const username = sessionStorage.getItem('username');
    const fname = sessionStorage.getItem('fname');
    if (username && fname) {
        const userInfoParagraph = document.querySelector('#accountPopup .userInfo');
        userInfoParagraph.textContent = `Username: ${username}, First Name: ${fname}`;
    } else {
        console.log('No user or first name found in session storage');
    }

}


