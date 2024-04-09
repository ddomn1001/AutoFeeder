from gpiozero import AngularServo
from gpiozero.exc import GPIOPinMissing, BadPinFactory, InputDeviceError
import time
import sys

try:
    # Originally Written by Mason, Hale, and Dominic
    # Initialize the servo motor
    servo = AngularServo(18, min_pulse_width=0.0003, max_pulse_width=0.0026)
    print("Servo initialized successfully.")

    # Time constant, Written By Dominic Nguyen and Mason Spillman
    TIME_LIMIT_SECONDS = 1.4
    
    # Calculate the end time
    end_time = time.time() + TIME_LIMIT_SECONDS
    
    # Set the target angle, Written by Mason
    target_angle = -35
    
    # Run the motor for the specified time duration, Angle Written by Mason, While Loop modified and written by Dominic Nguyen 
    # and Hale Anderson
    while time.time() < end_time:
        servo.angle = target_angle
    
    # Delay to allow the servo to reach the target angle
    time.sleep(0.25)
    
    # Check if the servo reached the target angle
    if round(servo.angle, 1) == target_angle:
        print("Motor moved successfully.")
    else:
        print("Error: Motor did not move as expected.")
        
    # Stop the servo motor after the loop, Written by Dominic Nguyen and Mason Spillman
    servo.angle = None
    time.sleep(1)

except GPIOError as e:
    # Handle GPIO communication error (potentially caused by wiring issues)
    print("Error: GPIO communication error. Please check wiring.")
    # Ensure servo is stopped before exiting
    if 'servo' in locals():
        servo.close()
    sys.exit()

except Exception as e:
    # Handle other exceptions
    print("Error: Failed to initialize servo.")
    print("An error occurred:", e)
    # Ensure servo is stopped before exiting
    if 'servo' in locals():
        servo.close()
    sys.exit()
