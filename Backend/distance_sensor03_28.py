# Written by Tyler Powell and Hale Anderson
from gpiozero import DistanceSensor
from time import sleep
import numpy as np
from remove_outliers import remove_outliers
import warnings

# Written by Hale Anderson
warnings.filterwarnings("ignore", category=Warning, module="gpiozero")
warnings.filterwarnings("ignore", category=UserWarning, module="gpiozero.input_devices")

# Written by Tyler Powell and Hale Anderson
sensor = DistanceSensor(trigger=18, echo=24)
max_attempts = 3
attempts = 0
avg_dis = -1000  # Set Value if it stays as this there was a problem with sensor in regards to readings

while attempts < max_attempts:
    distances = []
    for _ in range(10):
        sleep(0.25)
        distance = sensor.distance
        distance = distance * 100
        distance_cm = round(distance, 2)
        distances.append(distance_cm)

    distances = np.array(distances)
    distances = remove_outliers(distances)
    avg_dis = round((sum(distances) / len(distances)), 2)

    if 0 <= avg_dis <= 20:
        break 
    else:
        attempts += 1

print(avg_dis if 0 <= avg_dis <= 20 else -1000)

sensor.close()

