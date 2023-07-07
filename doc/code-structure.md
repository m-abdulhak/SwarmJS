

## Main Modules
- [Index](src/swarmjs-core/index.js): Provides the interface for starting and controlling the simulation, such as `initializeSimulation`, `resetSimulation`, `startBenchmark`, and `stopBenchmark`. It also exposes important objects that are imported and used when defining simulations and benchmarks such as `AvailableActuators`, `AvailableSensors`, `PositionsGenerators`, `PerformanceTrakers`, and `Controllers`.
- [Scene](src/swarmjs-core/scene.js): Defines the `Scene` class that initializes the simulation world and all other elements in the simulation such as static objects, robots, and pucks. It is also responsible for calculating and storing global maps and Voronoi Diagrams if they are enabled. 
- [Robot](src/swarmjs-core/robot/robot.js): Robots are the main active objects in the simulation. Robots can have simple or complex (compound) bodies, and rely on multiple other objects to define how they sense and interact with the environment such as [Sensors](src/swarmjs-core/robot/sensors), [Actuators](src/swarmjs-core/robot/actuators), and [Controllers](src/swarmjs-core/robot/controllers). 
- [Puck](src/swarmjs-core/puck.js): Pucks are the main passive objects in the simulation. They can be moved either passively as a result of collisions with the robot, or actively as a result of a robot actuator such as the [Grabber](src/swarmjs-core/robot/actuators/grabberActuator.js).
- [Static Objects](src/swarmjs-core/staticObjects): Completely static elements that cannot be moved or experience any change after they are defined. Two types of static objects are supported [Circles](src/swarmjs-core/staticObjects/staticCircle.js) and [Rectangles](src/swarmjs-core/staticObjects/staticRectangle.js). Other type of objects can be added but should adhere to the same interface define in the two previous classes. 
- [Benchmark](src/swarmjs-core/benchmarking/benchmark.js): This module is responsible for comparing different simulation scenarios by running and recording the simulation performance as defined by the provided [Trackers](src/swarmjs-core/benchmarking/performanceTrackers).
- [Renderer](src/swarmjs-core/rendering/renderer.js): Responsible for drawing the various elements in the simulation as defined in the renderables configurations.

## Other Modules:
- [Position Generators](src/swarmjs-core/utils/positionsGenerators): Higher order functions that return a function that generates positions in the environment. They are used to generate starting coordinates for the robots, goals, pucks, etc. They are useful for generating and repeating specific starting configurations for these elements.
- [Performance Trackers](src/swarmjs-core/benchmarking/performanceTrackers): Special objects that describe the simulation performance. Each object provides a function to calculate a performance metric at each simulation update. Each tracker will result in a separate graph in the benchmarking tab. Trackers should also define functions for reducing and aggregating values. [Tracker](src/swarmjs-core/benchmarking/performanceTrackers/tracker.js) can be used as a reference and extended as it provides most of the needed functionalities.
- [Controllers](src/swarmjs-core/robot/controllers): Controllers are higher order functions that return functions that control different aspects of the robots behaviors, they are called at each timestep when the simulation is updated. There are 4 types of controllers:
  + [Goal Controller](src/swarmjs-core/robot/controllers/goalControllers/simpleSortingGoalController.js): The main controller that implements the application specific algorithm, sets the goal of the robot at each timestep.
  + [Waypoint Controller](src/swarmjs-core/robot/controllers/waypointControllers/bvcWaypointController.js): Provides motion planning (collision avoidance and maneuverability) for the robots. While the goal controller is expected to be application-dependent, the waypoint controller can provide a more general motion planning that can be used across different simulation scenarios.
  + [Velocity Controller](src/swarmjs-core/robot/controllers/velocityControllers/omniDirVelocityController.js): provides the control signals (velocities) that should move the robot towards the waypoint.
  + [Actuator Controller](src/swarmjs-core/robot/controllers/actuatorsControllers/simpleSortingActuatorController.js): optional controller to control the actuators.
- [Sensors](src/swarmjs-core/robot/sensors): Objects that define how the robot can sense a specific aspect of the simulation, such as its own position and orientation, the position of neighboring robots, nearby objects, etc. Other sensors can easily be defined by extending the [Sensor](src/swarmjs-core/robot/sensors/sensor.js) class. Sensors can be implemented as either a class or a function but should implement the following interface:
  + sample(): calculates the value of the sensor
  + read(): returns the latest sampled value of the sensor
  + name: used to access (sample and read) the sensor through the sensor manager
  + type: determines when the sensor is sampled, possible values: onStart, onUpdate.
  + dependencies: optional, a list specifying any other sensors needed for this sensor to work, sensorManager uses these lists to generate a dependency graph and determine the order in which the sensors should be sampled.

  The name and sensor object should be exposed by default exporting an object with the following properties, and all sensors should be added to the 'availableSensorDefinitions' list in sensorManager:
  - name: the name of the sensor
  - Sensor: the sensor object
