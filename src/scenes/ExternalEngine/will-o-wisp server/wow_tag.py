'''
A WowTag (will-o-wisp tag) is distinct from one of the tags produced by
Apriltags.
'''

from math import atan2, pi

class WowTag:
    def __init__(self, id, x, y, angle):
        self.id = id
        self.x = x
        self.y = y
        self.angle = angle
    def __str__(self):
        return f"{self.id}, {self.x}, {self.y}, {self.angle}"

def raw_tags_to_wow_tags(raw_tags):
    wow_tags = []
    for raw_tag in raw_tags:
        cx = int(raw_tag.center[0])
        cy = int(raw_tag.center[1])
        #cv2.circle(raw_image, (cx, cy), 10, (255,0,255), thickness=5)

        # Estimate the angle, choosing corner 1 as the origin and corner 0
        # as being in the forwards direction, relative to corner 1.
        x = raw_tag.corners[0,0] - raw_tag.corners[1,0]
        y = raw_tag.corners[0,1] - raw_tag.corners[1,1]
        tag_angle = atan2(y, x) + pi/2
        #cv2.putText(raw_image, str(theta), (cx, cy), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

        wow_tag = WowTag(raw_tag.tag_id, cx, cy, tag_angle)
        wow_tags.append(wow_tag)
    return wow_tags