# Code Structure

This repository contains the source code for the `SwarmJS` simulator. The simulator is divided into three main modules:

#### [client](../src/client):

  The client module contains the code for the user interface and the rendering engine. It is written in JavaScript and uses `React`.

#### [common](../src/common):

The common module contains all the code for the simulation engine. It contains the following:

- [Index](../src/common/index.js): Provides the main entry for `SwarmJS`, including all the functions needed for starting and controlling the simulation, such as `initializeSimulation`, `resetSimulation`, `startBenchmark`, and `stopBenchmark`. It also exposes important objects that are imported and used when defining simulations and benchmarks such as `AvailableActuators`, `AvailableSensors`, `PositionsGenerators`, `PerformanceTrakers`, and `Controllers`.
- [Scene](../src/common/scene): Defines the `Scene` class that initializes the simulation world and all other elements in the simulation such as static objects, robots, and pucks. It is also responsible for calculating and storing global maps and Voronoi Diagrams if they are enabled. 
- [Robot](../src/common/robot): Robots are the main active objects in the simulation. Robots can have simple or complex (compound) bodies, and rely on multiple other objects to define how they sense and interact with the environment such as [Sensors](../src/common/robot/sensors), [Actuators](../src/common/robot/actuators), and [Controllers](../src/common/robot/controllers). 
- [Puck](../src/common/puck): Pucks are the main passive objects in the simulation. They can be moved either passively as a result of collisions with the robot, or actively as a result of a robot actuator such as the [Grabber](../src/common/robot/actuators/grabberActuator.js).
- [Static Objects](../src/common/staticObjects): Completely static elements that cannot be moved or experience any change after they are defined. Two types of static objects are supported [Circles](../src/common/staticObjects/staticCircle.js) and [Rectangles](../src/common/staticObjects/staticRectangle.js). Other type of objects can be added but should adhere to the same interface defined in the two previous classes. 
- [Benchmark](../src/common/benchmarking): This module is responsible for comparing different simulation scenarios by running and recording the simulation performance as defined by the provided [Trackers](../src/common/benchmarking/performanceTrackers).
- [Renderer](../src/common/rendering/renderer.js): Responsible for drawing the various elements in the simulation as defined in the renderables configurations.

#### [scenes](../src/scenes):
This module contains the various scenes provided with `SwarmJS`.

Each scene contains configuration files that describe the scene, including the scene name, description, and the various elements in the scene such as the environment, robots, pucks, and actuators.

Scenes can also define many other custom elements such controllers, sensors, trackers, generators, fields or any other type of component used in the scene.


All scenes defined here are automatically loaded and added to the scene selector in the quick actions menu.

New scenes can be defined and automatically injected into `SwarmJS`. The [advanced tutorial](./advanced-tutorial.md) includes a step-by-step guide on how to create new scenes.

The [demo](../src/scenes/PeripheryCluster) scene is a good starting point for understanding how scenes are defined.

The [Sorting](../src/scenes/Sorting) scene is a good example of a more complex scene that uses a multiple controllers.

The [VoronoiSorting](../src/scenes/VoronoiSorting) scene is a good example of a scene that implements a complex algorithm in an environment with static obstacles.

The [BeeClust](../src/scenes/BeeClust) scene is a good example of a scene that uses custom performance trackers to benchmark different scenarios.

The [FieldsDemo](../src/scenes/FieldsDemo) scene is a good example of a scene that uses custom fields in the environment and includes custom 'effects' that are applied to the simulation environment at each time step.



## Other Modules:

#### [Position Generators](../src/common/utils/positionsGenerators):
Higher order functions that return a function that generates positions in the environment. They are used to generate starting coordinates for the robots, goals, pucks, etc. They are useful for generating and repeating specific starting configurations for these elements.

#### [Performance Trackers](../src/common/benchmarking/performanceTrackers):

Special objects that describe the simulation performance. Each object provides a function to calculate a performance metric at each simulation update. Each tracker will result in a separate graph in the benchmarking tab. Trackers should also define functions for reducing and aggregating values. [Tracker](../src/common/benchmarking/performanceTrackers/tracker.js) can be used as a reference and extended as it provides most of the needed functionalities.
#### [Controllers](../src/common/robot/controllers):

Controllers are higher order functions that return functions that control different aspects of the robots behaviors, they are called at each time step when the simulation is updated. There are 4 types of controllers:
  - [Goal Controller](../src/scenes/VoronoiSorting/controllers/goalController.js): The main controller that implements the application specific algorithm, sets the goal of the robot at each time step.
  - [Waypoint Controller](../src/common/robot/controllers/waypointControllers/): Provides motion planning (collision avoidance and maneuverability) for the robots. While the goal controller is expected to be application-dependent, the waypoint controller can provide a more general motion planning that can be used across different simulation scenarios.
  - [Velocity Controller](../src/common/robot/controllers/velocityControllers): provides the control signals (velocities) that should move the robot towards the waypoint.
  - [Actuator Controller](../src/scenes/Sorting/robot/controllers/actuatorController.js): optional controller to control the actuators.

#### [Sensors](../src/common/robot/sensors):

Objects that define how the robot can sense a specific aspect of the simulation, such as its own position and orientation, the position of neighboring robots, nearby objects, etc. Other sensors can easily be defined by extending the [Sensor](../src/common/robot/sensors/sensor.js) class. Sensors can be implemented as either a class or a function but should implement the following interface:
  + sample(): calculates the value of the sensor
  + read(): returns the latest sampled value of the sensor
  + name: used to access (sample and read) the sensor through the sensor manager
  + type: determines when the sensor is sampled, possible values: onStart, onUpdate.
  + dependencies: optional, a list specifying any other sensors needed for this sensor to work, sensorManager uses these lists to generate a dependency graph and determine the order in which the sensors should be sampled.

  The name and sensor object should be exposed by default exporting an object with the following properties, and all sensors should be added to the 'availableSensorDefinitions' list in sensorManager:
  - name: the name of the sensor
  - Sensor: the sensor object
