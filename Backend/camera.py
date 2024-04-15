# Originally Written by Tyler Powell and Luke Saunders
# Modified by Tyler Powell

import os
import asyncio
import base64
import cv2
import websockets
import time
import json

os.environ['QT_QPA_PLATFORM'] = 'xcb'  # Set Qt platform to X11

async def upload_image(username):
    # async with websockets.connect('wss://www.jmuautofeeder.com') as websocket:
        try:
            # Capture image from camera using V4L2 backend
            camera = cv2.VideoCapture(0, cv2.CAP_V4L2)
            ret, frame = camera.read()
            camera.release()

            if not ret:
                print("Failed to capture image from webcam.")
                return
        
            # Generate a unique filename based on date, time, and username TIME DATE ADDED BY DOMINIC
            current_time = time.strftime("%Y-%m-%d %H:%M:%S")
            filename = f"{current_time}_{username}.jpg"

            # Save the image with the generated filename in the "images" folder
            image_folder = "images"
            if not os.path.exists(image_folder):
                os.makedirs(image_folder)
            
            # Check if the number of images in the folder exceeds 25
            images = os.listdir(image_folder)
            if len(images) >= 25:
                # Sort images by creation time and delete the oldest one
                images.sort(key=lambda x: os.path.getctime(os.path.join(image_folder, x)))
                os.remove(os.path.join(image_folder, images[0]))

            # Write the image to file
            filepath = os.path.join(image_folder, filename)
            cv2.imwrite(filepath, frame)

            # Encode image
            _, buffer = cv2.imencode('.jpg', frame)
            jpg_as_text = base64.b64encode(buffer)

            # Create a dictionary to hold username, datetime, and image data
            data = {
                "username": username,
                "datetime": current_time,  # Include datetime value
                "image_data": jpg_as_text.decode('utf-8')  # Convert bytes to string
            }

            # Convert dictionary to JSON string
            json_data = json.dumps(data)

            # Send JSON data over WebSocket
            await websocket.send(json_data)
            print("Image uploaded successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")

# Example usage
username = "test"
asyncio.run(upload_image(username))
