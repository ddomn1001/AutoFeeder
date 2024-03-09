#ClientSide Server Script, Created by DOMINIC NGUYEN
#Used to authenticate using LOGIN/PASSWORD
#USES Authentication Tokens for each session
import requests

# Function to authenticate user and get authentication token
def authenticate(username, password):
    url = 'https://www.jmuautofeeder.com/login'  # Change this to your server's login endpoint
    credentials = {'username': username, 'password': password}
    response = requests.post(url, json=credentials)
    print("Response content:", response.text)  # Print the response content for debugging
    if response.status_code == 200:
        data = response.json()
        if 'authToken' in data:
            return data['authToken']
        else:
            print("Authentication token not found in response")
            return None
    else:
        print("Error:", response.json()['message'])
        return None

# Function to update feeding information
def update_feeding_info(auth_token, fed, amount):
    url = 'https://www.jmuautofeeder.com/update-feeding-info'  # Change this to your server's update endpoint
    headers = {'Authorization': auth_token}
    feeding_info = {'fed': fed, 'amount': amount}
    response = requests.post(url, json=feeding_info, headers=headers)
    if response.status_code == 200:
        print("Feeding information updated successfully")
    else:
        print("Error updating feeding information:", response.json()['message'])

# Example usage
username = 'root'
password = 'root'

# Authenticate user and get authentication token
auth_token = authenticate(username, password)

if auth_token:
    # Use authentication token to update feeding information
    fed = True  # Change this to true or false
    amount = 100  # Change this to the desired amount
    update_feeding_info(auth_token, fed, amount)
