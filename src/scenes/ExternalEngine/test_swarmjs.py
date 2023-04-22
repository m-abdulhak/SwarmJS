#!/usr/bin/env python

'''
A script to test SwarmJSLevel.
'''
import time

from swarmjs_level import SwarmJSLevel
from wow_tag import WowTag 
level = SwarmJSLevel("IGNORED PARAMS")

logging = False

if __name__ == "__main__":
    print('started')
    wow_tags = [WowTag(0, 541, 260, 0), WowTag(1, 300, 182, 0)]
    print("Looping forever...")

    while True:
        goals = level.get_goals("", wow_tags)

        if logging:
            print('*******************************************************')
            print('New goals in main loop', goals)
    
        # simulate robot movement (in real case should retrieved from actual robots)
        for robotId in goals:
            
            [robotWaypointX, robotWaypointY] = goals[robotId]

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
        