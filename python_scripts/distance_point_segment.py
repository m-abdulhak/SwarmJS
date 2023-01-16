#! /usr/bin/env python

# Find the minimum distance between a point and a line segment.
# Ported from C/JavaScript implementation by Grumdrig
# http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
import math

#class Point(object):
#  def __init__(self, x, y):
#    self.x = float(x)
#    self.y = float(y)

def square(x):
    return x * x
  
def distance_squared(v, w):
    return square(v[0] - w[0]) + square(v[1] - w[1])

def distance_point_segment_squared(p, v, w, only_along_segment):
    # Segment length squared, |w-v|^2
    d2 = distance_squared(v, w) 
    if d2 == 0: 
        # v == w, return distance to v
        return distance_squared(p, v)
    # Consider the line extending the segment, parameterized as v + t (w - v).
    # We find projection of point p onto the line.
    # It falls where t = [(p-v) . (w-v)] / |w-v|^2
    t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / float(d2)
    if t < 0:
        if only_along_segment:
            return float('inf')
        # Beyond v end of the segment
        return distance_squared(p, v)
    elif t > 1.0:
        if only_along_segment:
            return float('inf')
        # Beyond w end of the segment
        return distance_squared(p, w)
    else:
        # Projection falls on the segment.
        proj = (v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]))
        # print proj[0], proj[1]
        return distance_squared(p, proj)
  
def distance_point_segment(p, v, w, only_along_segment):
    return math.sqrt(distance_point_segment_squared(p, v, w, only_along_segment))

def distance_point_segment_projection(p, v, w, only_along_segment):
    # Segment length squared, |w-v|^2
    d2 = distance_squared(v, w) 
    if d2 == 0: 
        # v == w, return distance to v
        return v
    # Consider the line extending the segment, parameterized as v + t (w - v).
    # We find projection of point p onto the line.
    # It falls where t = [(p-v) . (w-v)] / |w-v|^2
    t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / float(d2)
    if t < 0:
        if only_along_segment:
            return None
        # Beyond v end of the segment
        return v
    elif t > 1.0:
        if only_along_segment:
            return None
        # Beyond w end of the segment
        return w
    else:
        # Projection falls on the segment.
        proj = (v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1]))
        # print proj[0], proj[1]
        return (proj[0], proj[1])
    
if __name__ == "__main__":
    p = (0,0)
    v = (-1,1)
    w = (1,1)
    assert distance_point_segment(p, v, w, False) == 1.0
  
    v = (-1,-1)
    w = (1,1)
    assert distance_point_segment(p, v, w, False) == 0.0
  
    v = (0,5)  
    w = (10,-5)
    assert distance_point_segment(p, v, w, False) == math.sqrt(6.25 + 6.25)
    
    v = (10,10)
    w = (20,20)
    assert distance_point_segment(p, v, w, False) == math.sqrt(100 + 100)
    print("Done.")
