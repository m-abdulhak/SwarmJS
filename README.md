<h1 align="center">
SwarmJS
</h1>

![image](https://user-images.githubusercontent.com/5468250/149712476-0fa0c7b0-bf23-409d-9dff-90b92c9cbbb7.png)

## tasks
- [ ] reimplement orbital construction in python
- [ ] add RL to it according [paper]()
## connection to python
- you should be installing all the dependencies for python:
```
pip install Flask Flask-SocketIO
pip install simple-websocket
```
- run flask by
```
flask --app src/scenes/OrbitalConstructionBridge/externalControllerServer.py run
```
## About
SwarmJS is an interactive 2D swarm robotics simulator built on the [Matter.js](https://github.com/liabru/matter-js) physics engine and uses [D3.js](https://github.com/d3/d3) for rendering and [React](https://github.com/facebook/react) for the UI. A demo is available [here](https://m-abdulhak.github.io/SwarmJS).

## Quick Actions
A list of quick action buttons can be found above the simulation window including:
- Toggle Rendering: Enables / disables the rendering of the simulation. Disabling the simulation can lead to 2x better performance while the simulation is running.
- Toggle UI: Enables / disables an experimental user interface that displays more options and the benchmarking graphs. This UI is still very much in early development and suffers from bad performance. Disabling this UI can lead to 2x better performance while the simulation is running.
- Reset Simulation
- Pause / Resume simulation
- Start / Stop benchmarking
- Benchmark Runs: Number of times the benchmark has finished a simulation run across all provided simulation scenarios.
- Simulation Time

## Quick Start:
```
git clone https://github.com/m-abdulhak/SwarmJS.git
cd SwarmJS
npm install
npm run dev
```
The `App` component provides the entry point of the simulator, three parameters should be passed:
- `config` defines the simulation configuration
- `benchSettings` defines the benchmarking configurations 
- `description` provides an HTML description to be displayed

Two [example configurations](src/swarmjs-core/exampleConfigs) are provided and can be used to start new simulations:
```
import { exampleConfigs } from './swarmjs-core';

const { simConfig, benchmarkConfig } = exampleConfigs.voronoiSorting;
// or: const { simConfig, benchmarkConfig } = exampleConfigs.simpleSorting;

ReactDOM.render(
  <App config={simConfig} benchSettings={benchmarkConfig}/>,
  document.getElementById('root')
);
```

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

## Configuration
Simulations are generated based on configuration objects passed to the SwarmJS library. Two [Example](src/swarmjs-core/exampleConfigs) configurations are provided.
Below are the main parameters that can be used:
- env:
  + width: width of the simulated environment
  + height: height of the simulated environment
  + speed: relative speed of the simulation
- objects: a list of static object definitions, two types of static objects are supported, circles and rectangles.
  + type: `'rectangle'` or `'circle'`
  + center: the center of the object
  + radius: radius of the circle, for circles only.
  + width: width of the rectangle, for rectangles only.
  + height: height of the rectangle, for rectangles only.
- robots:
  + count: number of the robots
  + radius: radius of the robots
  + controllers: controllers are either passed directly or along with tuning parameters using the `controller` and `params` keys. Both syntax are present in the provided example configurations.
Below are the 4 types of controllers that can be defined:   
    - goal: sets the goal of the robot at each timestep. Accepts 3 parameters `oldGoal, sensors, actuators` and returns the new goal.
    - waypoint: provides motion planning for the robots. Accepts 3 parameters `goal, sensors, actuators` and returns a waypoint for the robot to head towards.
    - velocity: provides the control signals (velocities) that should move the robot towards the waypoint. Accepts 3 parameters `goal, sensors, actuators` and returns a vector of velocities `{ linearVel, angularVel }`.
    - actuator: optional controller to control the actuators. Accepts 2 parameters `sensors, actuators` and does not return any value.
  + sensors: list of enabled sensors.
  + actuators: list of enabled actuators.
  + useVoronoiDiagram: boolean, if `true` the Voronoi diagram for the robots is calculated at each timestep.
- pucks:
  + groups: list of puck group definitions, each should contain:
    - id: unique value for each group
    - color: unique color for each group
    - count: number of pucks in the group
    - radius: radius of each puck in the group
    - goal: coordinates of the center of the goal area the pucks should be gathered at (if one exists)
    - goalRadius: radius of the goal area (if one exists)
  + useGlobalPuckMaps: boolean, if `true` a goal map for each puck group will be calculated at the start of the simulation, for each point in the environment the map provides a corresponding goal point where the puck should go towards to reach the group goal, useful for environments with static obstacles, but has a huge impact on the startup time of the simulation, should be disabled if not used.

## Benchmarking
Benchmarks provide an easy way to run multiple simulations and compare them across multiple runs using specific metrics. Two [Example](src/swarmjs-core/exampleConfigs) benchmark configurations are provided.
Below are the main parameters that should be preset:
- simConfigs: a list of configuration objects that describe different simulation scenarios, each object should include:
  + name: unique name for this scenario, will be used to refer to this scenario in the benchmarking graphs.
  + simConfig: a simulation configuration object that should adhere to the specifications described in the previous section, not all parameters should be specified here, but rather only the ones that separate this scenario from the main simulation scenario. These differences can be simple such as changing the defined static objects, number or radius of robots, number of puck groups or the number or radius of the pucks; or they can be more specific such as comparing different controllers or even changing specific parameters for the same controller. Any property in the main simulation configuration can be overriden here.
- timeStep: minimum reported time step in the graphs
- maxTimeStep: length of each simulation run while benchmarking
- trackers: list of special objects that describe the performance and provide a function to calculate a performance metric at each simulation update.

## Rendering
A configuration-based rendering engine was built on top of [D3.js](https://github.com/d3/d3) to rapidly define renderable elements in the simulation with minimal code. A simple configuration format is used to define each renderable element, its attributes, and attach it to a specific object in the environment so that it is automatically updated while the simulation is running.
Renderables can be defined within any module in the simulator but they should always be imported and registered into the [renderering module](src/swarmjs-core/rendering/renderer.js). Examples of renderable definitions can be found in the [Scene](src/swarmjs-core/scene.js), [Robot](src/swarmjs-core/robot/robot.js), and [Puck](src/swarmjs-core/puck.js) modules. 
Each renderable element can include the following parameters:
- type: mandatory, used for grouping renderables into UI buttons to enable/disable them.
- svgClass: optional, used to add classes to the svg elements
- dataPoints: optional, defines the data points if the renderable is repeated for multiple objects such as robots, pucks, or static objects. DataPoints are usually defined as a property of the scene with the 'sceneProp' key. If dataPoints are defined, `prop` key can be used in the following configurations to refer to properties of the datapoint object. Otherwise, only 'sceneProp' can be used throughout the renderable definition.
- shape: mandatory, svg shape to be rendered (https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes)
- staticAttrs: optional, defines the attributes to be set only once when the element is initialized
- styles: optional, defines the styling attributes for the element, also only applied once, when the element is initialized
- dynamicAttrs: optional, defines the attributes to be set on every simulation update
- drag: optional, defines the draggable behavior for the element through the following properties:
  + prop: the property of the datapoint to be set using the element drag event when dragging, such as the `position` of the robot
  + pause: whether the simulation should be paused while dragging the element
  + onStart / onEnd: define the actions to be performed when dragging starts and ends
    - styles: defines the styles to set when dragging starts / ends
    - log: defines the attributes to be logged to console when dragging starts / ends
  + onDrag: defines the actions to be performed when dragging
    - log: defines the attributes to be logged to console when dragging is in progress
### Syntax
Any property can be one of the following:
- `string` or `number`: the value is set directly
- `{ prop, modifier }` : the value of `prop` is parsed as a property of the datapoint, a `modifier` function can be defined to modify the value after it is parsed
- `{ sceneProp }`: the value is parsed as a property of the scene, a `modifier` function can be defined to modify the value after it is parsed
- `{ special }` : used for special behaviors, such as setting a color according to the color schema, currently only `schemaColor` is supported

### TODO:
- add info about scenes
- add info about overriding sensors & renderables
- add info about 'relative' vs 'absolute' velocity controllers
- add info about adding background image to scenes 
- add info about fields and field sensor
- add info about user-defined controller 
- add info about external connection
- add info about render skip and disable rendering