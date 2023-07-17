
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
