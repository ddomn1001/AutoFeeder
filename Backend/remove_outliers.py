 # Written by Tyler Powell
import numpy as np

def remove_outliers(arr, threshold=1.5):
	q25, q75 = np.percentile(arr, 25), np.percentile(arr, 75)
	iqr = q75 - q25
	cut_off	= iqr * threshold
	lower, upper = q25 - cut_off, q75 + cut_off
	outliers_removed = [x for x in arr if x >= lower and x <= upper]
	return outliers_removed
