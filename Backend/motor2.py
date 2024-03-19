#Script to Operate Motor, Written by Mason, Hale and Dominic
from gpiozero import AngularServo
import time

#Time Constant, Written By Dominic Nguyen and Mason Spillman
TIME_LIMIT_SECONDS = 1.5
#Written by Mason
servo = AngularServo(18, min_pulse_width=0.0003, max_pulse_width=0.0026)

# Calculate the end time - Written by Dominic Nguyen and Mason Spillman
end_time = time.time() + TIME_LIMIT_SECONDS

# Angle Written by Mason, While Loop modified and written by Dominic Nguyen 
# and Hale Anderson
while time.time() < end_time:
    servo.angle = -35
   
# After the loop, stop the servo - Written by Dominic Nguyen and Mason Spillman
servo.angle = None
time.sleep(1)
