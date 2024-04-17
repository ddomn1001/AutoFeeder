# camera.py

import cv2
import base64
import os
from datetime import datetime

def capture_image_and_save():
    # Capture image from camera
    camera = cv2.VideoCapture(0)
    ret, frame = camera.read()
    camera.release()

    if not ret:
        print("Failed to capture image from webcam.")
        return None

    # Convert image to JPEG format
    _, buffer = cv2.imencode('.jpg', frame)
    
    # Convert image buffer to Base64 string
    image_data_base64 = base64.b64encode(buffer).decode('utf-8')

    # Create folder if it doesn't exist
    image_folder = "images"
    if not os.path.exists(image_folder):
        os.makedirs(image_folder)

    # Get list of existing image files
    images = os.listdir(image_folder)

    # Check if number of images exceeds a limit (e.g., 25)
    image_limit = 25
    if len(images) >= image_limit:
        # Sort images by creation time
        images.sort(key=lambda x: os.path.getctime(os.path.join(image_folder, x)))

        # Delete the oldest images to maintain the limit
        for i in range(len(images) - image_limit + 1):
            os.remove(os.path.join(image_folder, images[i]))

    # Generate filename based on current date and time
    filename = datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + ".jpg"

    # Write the image to file
    with open(os.path.join(image_folder, filename), 'wb') as f:
        f.write(buffer)

    return image_data_base64

# Example usage
if __name__ == "__main__":
    image_data = capture_image_and_save()
    if image_data:
        print(image_data)
