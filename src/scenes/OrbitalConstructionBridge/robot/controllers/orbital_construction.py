class Dict_2_Obj:
  def __init__(self, **kwargs):
    for key, value in kwargs.items():
        setattr(self, key, value)

class Orbital_Construction:
  def __init__(self,CONST) -> None:

    self.CONST = Dict_2_Obj(**CONST)

  def calculate_angular_speed(self , sensors):

    if (not sensors.fields.readings.heatMap.leftField) \
        or (not sensors.fields.readings.heatMap.frontField) \
        or (not sensors.fields.readings.heatMap.rightField): 
      return 0

    l = (sensors.fields.readings.heatMap.leftField)[0] / 255
    c = (sensors.fields.readings.heatMap.frontField)[0] / 255
    r = (sensors.fields.readings.heatMap.rightField)[0] / 255

    leftPucks = sensors.polygons.left.reading.pucks
    rightPucks = sensors.polygons.right.reading.pucks


    if (sensors.circles.leftObstacle.reading.robots > 0 or sensors.circles.leftObstacle.reading.walls > 0) :
      return self.CONST.maxAngularSpeed
    
    if (r >= c and c >= l): 
      if (self.CONST.innie and rightPucks > 0) :
        return self.CONST.maxAngularSpeed
      if (not self.CONST.innie and leftPucks > 0) :
        return -self.CONST.maxAngularSpeed
      

      if (c < self.CONST.tau):
        return 0.3 * self.CONST.maxAngularSpeed;
      
      return -0.3 * self.CONST.maxAngularSpeed;
    
    
    if (c >= r and c >= l):
      return -self.CONST.maxAngularSpeed

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
    #   print("Sensors not readable yet.")
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


