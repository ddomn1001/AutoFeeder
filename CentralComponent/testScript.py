#This script is used to test adding a value based on the amount to a file. This will simulate the functionality of running the food dispensing script.
#Script completely written by Dominic Nguyen
import os

def append_hi_to_file(directory, amount):
    file_path = os.path.join(directory, "output.txt")
    with open(file_path, "a") as file: 
        for _ in range(amount):
            file.write("yo\n")

# Example usage:
output_directory = r'C:\Users\domth\OneDrive\Desktop\CentralComponent'
amount = 1  
append_hi_to_file(output_directory, amount)
