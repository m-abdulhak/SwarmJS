#!/usr/bin/env python

'''
A script to test SwarmJSLevel.
'''
import time

from swarmjs_level import SwarmJSLevel
from wow_tag import WowTag 

logging = False

if __name__ == "__main__":
    print('started')
    wow_tags = [WowTag(0, 541, 260, 0), WowTag(1, 300, 182, 0)]
    level = SwarmJSLevel("IGNORED PARAMS")
    print("Looping forever...")

    while True:
        journey_dict = level.get_journey_dict("", wow_tags)

        if logging:
            print('*******************************************************')
            print('New journey_dict in main loop', journey_dict)
    
        # simulate robot movement (in real case should retrieved from actual robots)
        for robotId in journey_dict:
            
            (sameX, sameY, sameAngle, robotWaypointX, robotWaypointY) = journey_dict[robotId]

            robotNum = int(robotId)
            robotPosition = wow_tags[robotNum]
            
            if (robotPosition != None):
                newPosX = robotPosition.x + (robotWaypointX - robotPosition.x) / 50
                newPosY = robotPosition.y + (robotWaypointY - robotPosition.y) / 50
                wow_tags[robotNum] = WowTag(robotNum, newPosX, newPosY, robotPosition.angle)

        if logging:
            print('New Positionsin main loop', wow_tags)
            print('*******************************************************')

        time.sleep(0.1)
        