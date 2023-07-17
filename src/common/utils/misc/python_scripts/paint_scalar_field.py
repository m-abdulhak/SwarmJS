#! /usr/bin/env python
"""
Paint a scalar field into an image and write it into a file.
"""

import numpy as np
import cv2
from math import ceil, sqrt
from random import random
from distance_point_segment import *

#
# Parameters and important constants...
#

max_value = 255

# For legal-sized paper at 150 dpi
# (see http://www.cbrubin.net/digital_skills/print&scan/size.html)
#width = 1125
#height = 1950

# For B0 paper which is 1000.0 mm by 1414.0 mm at 300 dpi
#width = 12900
#height = 18240 / 2

width = 600
height = 400
#width = 1024
#height = 540

cell_radius = 0#1#10
cell_width = cell_radius * 2 + 1

#filename = "scalar_field_random_{}_B0_half.png".format(cell_width)
filename = "scalar_field.png"

# Location of centre --- if using value_function_centre()
cx = width/2
cy = height/2
#cy = height
#max_distance_from_centre = sqrt(cx**2 + cy**2)
#max_distance_from_centre = min(cx, cy)
max_distance_from_centre = max(cx, cy, width - cx, height - cy)

# Location of segment --- if using value_function_segment()
#(seg_x0, seg_y0) = (width/4, height/2)
#(seg_x1, seg_y1) = (3*width/4, height/2)
#print("({},{}) -> ({}, {})".format(seg_x0, seg_y0, seg_x1, seg_y1))
#max_distance_from_segment = height/2

#
# Different paint operations...
#

def paint(image, value_function, application_function):
    for y in range(cell_radius, height, cell_width):
        #print "outside range: {}".format(range(cell_radius, height, cell_width))

        for x in range(cell_radius, width, cell_width):

            #print "({}, {})".format(x, y)

            value_0_to_1 = value_function(x, y)
            applied_value = application_function(value_0_to_1)

            for j in range(y-cell_radius, y+cell_radius+1):
                #print "\tinside range: {}".format(range(y-cell_radius, y+cell_radius+1))
                for i in range(x-cell_radius, x+cell_radius+1):
                    #print "\t({}, {})".format(i, j)
                    image[j, i] = applied_value

def value_function_centre(x, y):
    distance_from_centre = sqrt((x - cx)**2 + (y - cy)**2)
    value = (1.0 - distance_from_centre / max_distance_from_centre)
    value = min(1.0, value)
    value = max(0.0, value)
    return value

def value_function_segment(x, y):
    distance = distance_point_segment((x, y), (seg_x0, seg_y0),
                                      (seg_x1, seg_y1), False)
    value = (1.0 - distance / max_distance_from_segment)
    value = min(1.0, value)
    value = max(0.0, value)
    return value

def value_function_top(x, y):
    return (1.0 - y / float(height))

def application_function_direct(value_0_to_1):
    return ceil(max_value * value_0_to_1)

def application_function_probability(value_0_to_1):
    if random() < value_0_to_1:
        return max_value
    return 0

# Create a black image
image = np.zeros((height, width, 1), np.uint8)

# Apply a paint operation (defined above).
#paint(image, value_function_top, application_function_direct)
#paint(image, value_function_top, application_function_probability)
#paint(image, value_function_centre, application_function_probability)
paint(image, value_function_centre, application_function_direct)
#paint(image, value_function_segment, application_function_direct)

print("Writing {}".format(filename))
cv2.imwrite(filename, image)
