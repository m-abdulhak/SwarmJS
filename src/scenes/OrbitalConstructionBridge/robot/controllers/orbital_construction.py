def build_object_from_dict(data):
    if isinstance(data, dict):
        obj = type('Object', (), {})()  # Create an empty object
        for key, value in data.items():
            setattr(obj, key, build_object_from_dict(value))  # Recursively build nested objects
        return obj
    else:
        return data

class Orbital_Construction:
  def __init__(self) -> None:
    pass

  def calculate_angular_speed(self , sensors_dict , CONST):
    CONST = build_object_from_dict(CONST)
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
      return CONST.maxAngularSpeed
    
    elif (r >= c and c >= l): 
      if (CONST.innie and sensors.rightPucks > 0) :
        # print("2")
        return CONST.maxAngularSpeed
      elif (not CONST.innie and sensors.leftPucks > 0) :
        # print("3")
        return -CONST.maxAngularSpeed
      elif (c < CONST.tau):
        # print("4")
        return 0.3 * CONST.maxAngularSpeed
      else:      
        # print("5")
        return -0.3 * CONST.maxAngularSpeed
    
    
    elif (c >= r and c >= l):
      # print("6")
      return -CONST.maxAngularSpeed
    else:
      # print("7")
      return CONST.maxAngularSpeed

if __name__ == '__main__':
  pass


