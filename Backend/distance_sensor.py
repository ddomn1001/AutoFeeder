# Written by Tyler Powell and Hale Anderson
from gpiozero import DistanceSensor
from gpiozero.exc import GPIOPinMissing, BadPinFactory, InputDeviceError
from time import sleep
import numpy as np
from remove_outliers import remove_outliers
import warnings

# Written by Hale Anderson
warnings.filterwarnings("ignore", category=Warning, module="gpiozero")
warnings.filterwarnings("ignore", category=UserWarning, module="gpiozero.input_devices")
# Written by Hale Anderson
try:
    attempts = 0
    while attempts < 3:
        try:
            # Initialize the distance sensor
            sensor = DistanceSensor(trigger=18, echo=24)
            distances = []

            # Read distance data 10 times
            for _ in range(10):
                sleep(0.25)
                distance = sensor.distance * 100  # Convert to centimeters
                distances.append(round(distance, 2))
                print(distance)

            # Convert distances list to a NumPy array and remove outliers
            distances = np.array(distances)
            distances = remove_outliers(distances)

            # Calculate the average distance
            avg_distance = round(np.mean(distances), 2)
            

            # Close the sensor connection
            sensor.close()

            if avg_distance <= 20:
                print("Average Distance:", avg_distance)
                break
            else:
                attempts += 1
                print(f"Attempt {attempts} failed. Retrying...\n")
                sleep(1)  # Wait for 1 second before retrying

        except (GPIOPinMissing, BadPinFactory, InputDeviceError) as e:
            print("Connection issue detected. Please check the wiring.")
            print("Error:", e)
            sleep(2)  # Wait for 2 seconds before retrying

    if avg_distance > 20:
        print("Sensor cannot read.")
# Written by Hale Anderson
except KeyboardInterrupt:
    # Handle keyboard interrupt (Ctrl+C)
    print("Measurement interrupted by user.")
# Written by Hale Anderson
except Exception as e:
    # Handle other exceptions
    print("An error occurred:", e)
