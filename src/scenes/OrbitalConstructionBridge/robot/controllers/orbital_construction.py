def build_object_from_dict(data):
    if isinstance(data, dict):
        obj = type('Object', (), {})()  # Create an empty object
        for key, value in data.items():
            setattr(obj, key, build_object_from_dict(value))  # Recursively build nested objects
        return obj
    else:
        return data

class Orbital_Construction:
  def __init__(self,CONST) -> None:

    self.CONST = build_object_from_dict(CONST)

  def calculate_angular_speed(self , sensors_dict):
    sensors = build_object_from_dict(sensors_dict)
    #! doesn't function same as JS
    # if (not sensors.leftField) \
    #     or (not sensors.centreField) \
    #     or (not sensors.rightField): 
    #   # print("0  ")
    #   return 0

    l = (sensors.leftField) / 255
    c = (sensors.centreField) / 255
    r = (sensors.rightField) / 255

    if (sensors.leftRobots or sensors.leftWalls) :
      # print("1")
      return self.CONST.maxAngularSpeed
    
    elif (r >= c and c >= l): 
      if (self.CONST.innie and sensors.rightPucks > 0) :
        # print("2")
        return self.CONST.maxAngularSpeed
      elif (not self.CONST.innie and sensors.leftPucks > 0) :
        # print("3")
        return -self.CONST.maxAngularSpeed
      elif (c < self.CONST.tau):
        # print("4")
        return 0.3 * self.CONST.maxAngularSpeed
      else:      
        # print("5")
        return -0.3 * self.CONST.maxAngularSpeed
    
    
    elif (c >= r and c >= l):
      # print("6")
      return -self.CONST.maxAngularSpeed
    else:
      # print("7")
      return self.CONST.maxAngularSpeed

  def calculate_speed_command(self,sensors):

    return self.calculate_angular_speed(sensors)
  #   command = {}
  #     return {
  #   linearVel: forwardSpeed * robot.velocityScale,
  #   angularVel: angularSpeed * robot.velocityScale,
  #   type: robot.SPEED_TYPES.RELATIVE
  # };

    # if sensors.fields.readings.heatMap.leftField == "null" : #!
    #   # print("Sensors not readable yet.")
    #   return self.command

    # leftField = (sensors.fields.readings.heatMap.leftField)[0]
    # centreField = (sensors.fields.readings.heatMap.frontField)[0]
    # rightField = (sensors.fields.readings.heatMap.rightField)[0]

    # leftPucks = sensors.polygons.left.reading.pucks
    # rightPucks = sensors.polygons.right.reading.pucks

    # # We'll make these Boolean since the number shouldn't really change the response.
    # leftRobots = sensors.circles.leftObstacle.reading.robots > 0
    # leftWalls =  sensors.circles.leftObstacle.reading.walls > 0
    # # VAR.socket.emit('custom_message' , leftWalls);


if __name__ == '__main__':
  pass


