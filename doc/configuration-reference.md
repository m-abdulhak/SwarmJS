
# Configuration Reference

Simulations are generated based on scenes, each scene defines a simulation configuration object which is then injected into  the `SwarmJS` library.

The configuration object defines all the parameters that describe the simulation, including the environment, robots, pucks, and others.

This is an example configuration object:
```js
const simConfig = {
  env: {
    width: 600,
    height: 400,
    renderSkip: 1,
    fields: {
      pheromone: {
        url: pheromoneUrl,
        defaultBackground: true,
        title: 'Pheromone'
      },
      occupancy: {
        url: occupancyUrl,
        title: 'Occupancy'
      }
    },
    effects: [
      {
        func: fieldEffects,
        framesBetweenRuns: 10
      }
    ]
  },
  robots: {
    count: 10,
    radius: 4,
    controllers: {
      velocity: {
        controller: (robot) => {
          const maxAngularSpeed = 0.015;
          const maxForwardSpeed = 0.2;

          return (sensors) => {
            const leftPucks = sensors.polygons.left.reading.pucks;
            const angularSpeed = leftPucks > 0 ? -maxAngularSpeed : maxAngularSpeed;

            return {
              linearVel: maxForwardSpeed * robot.velocityScale,
              angularVel: angularSpeed * robot.velocityScale,
              type: robot.SPEED_TYPES.RELATIVE
            };
          };
        }
      },
      supportsUserDefinedControllers: false,
      misc: {
      sceneSpecificMap: 'test'
    }
    },
    sensors: [
      ...Object.values(CoreSensors),
      {
        ...ExtraSensors.polygons,
        params: {
          regions:
              [
                {
                  name: 'left',
                  vertices: [
                    { type: 'Polar', name: '0', coords: { distance: 100, angle: (-0.25 * Math.PI) / 2 } },
                    { type: 'Polar', name: '1', coords: { distance: 100, angle: (0.0 * Math.PI) / 2 } },
                    { type: 'Cartesian', name: 'bottomRight', coords: { x: 0, y: 5 } }
                  ],
                  sensedTypes: ['pucks']
                }
              ]
        }
      }
    ],
    actuators: [CoreActuators.grabber],
    useVoronoiDiagram: false
  },
  pucks: {
    groups: [
      {
        id: 0,
        count: 100,
        radius: 8,
        color: 'red'
      }
    ],
    useGlobalPuckMaps: false
  },
  objects: [
    {
      type: 'rectangle',
      center: { x: 750, y: 100 },
      width: 350,
      height: 50
    },
    {
      type: 'circle',
      center: { x: 100, y: 150 },
      radius: 50
    }
  ],
  positionsGenerator: CorePositionsGenerators.randomCollisionFree,
  renderables: [
    { module: 'Scene', elements: SceneRenderables },
    { module: 'Puck', elements: PuckRenderables },
    { module: 'Robot', elements: MyRobotRenderables }
  ],
  dynamicPropertyDefinitions: [
    defaultDynamicPropertyDefinitions.velocityScale
  ],
  staticPropertyDefinitions: Object.values(defaultStaticPropertyDefinitions)
};
```

Below is a description of the main parameters in the configuration object:

- env:
  + width: width of the simulated environment
  + height: height of the simulated environment
  + renderSkip: Number of simulation steps to skip before each render update, useful for speeding up the simulation when the rendering is slowing it down.
  + fields: An object containing field configurations. Each field configuration has the following properties:
    * url: The URL where the field data can be fetched
    * defaultBackground: A boolean indicating whether this field should be used as the default background
    * title: The title of the field
  + effects: An array of effects to be applied in the simulation. An effect is a function that runs periodically and include any behavior that should be applied to the simulation environment, such as updating the field values to simulate diffusion or evaporation.
  Each effect has the following properties:
    * func: The function to be run for the effect
    * framesBetweenRuns: The number of frames to skip between runs of the effect function
- objects: list of definitions for static object in the environment, each definition should contain:
  + type: The shape of the object. Can be `'rectangle'` or `'circle'`.
  + center: the center of the object
  + radius: radius of the circle, for circles only.
  + width: width of the rectangle, for rectangles only.
  + height: height of the rectangle, for rectangles only.
- robots:
  + count: number of the robots
  + radius: radius of the robots
  + controllers: controllers are either passed directly or along with tuning parameters using the `controller` and `params` keys. Both syntax are present in the provided example configurations.
  + misc: [optional] any additional data that should be passed to the robots, can be accessed using `robot.misc` in the robot code.
Below are the 4 types of controllers that can be defined:   
    - goal: [optional] sets the goal of the robot at each time step. 
    - waypoint: [optional] provides motion planning for the robots, sets a waypoint for the robot to head towards at each time step.
    - velocity: [mandatory] provides the control signals (velocities) that should move the robot towards the waypoint, returns an object defining the robot velocity with the following shape: `{ linearVel, angularVel, type }`.
    - actuator: [optional] controls the actuators directly and does not return any value.
  + sensors: list of enabled sensors including any customization or tuning parameters for each sensor, such as the sensor range.
  + actuators: list of enabled actuators.
  + useVoronoiDiagram: boolean, if `true`, a Voronoi diagram for the robots is calculated at each time step.
- pucks:
  + groups: list of puck group definitions, each should contain:
    - id: unique value for each group
    - color: unique color for each group
    - count: number of pucks in the group
    - radius: radius of each puck in the group
    - goal: [optional] coordinates of the center of the goal area the pucks should be gathered at (if one exists)
    - goalRadius: [optional] radius of the goal area (if one exists)
  + useGlobalPuckMaps: boolean, if `true` a goal map for each puck group will be calculated at the start of the simulation, for each point in the environment the map provides a corresponding goal point where the puck should go towards to reach the group goal, useful for environments with static obstacles, but has a huge impact on the startup time of the simulation, should be disabled if not used.
- positionsGenerator: The function used to generate initial positions for the robots, pucks, and robot goals, among others. 
- renderables: definitions for elements to be rendered in the simulation, for more details check the [rendering reference](./rendering-reference.md).
- dynamicPropertyDefinitions: The dynamic properties that can be changed during the simulation, each definition generates a slider in the dynamic configurations panel in the UI.
- staticPropertyDefinitions: The static properties that can be changed before the simulation starts, each definition generates a slider in the static configurations panel in the UI.

## Benchmarking
Benchmarks provide an easy way to run multiple simulations and compare them across multiple runs using specific metrics.

This is an example benchmark configuration:
```js

const benchmarkConfig = {
  simConfigs: [
    {
      name: '5 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          count: 5,
          params: {
            velocityScale: 50
          }
        }
      }
    },
    {
      name: '20 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          params: {
            velocityScale: 50
          }
        }
      }
    }
  ],
  trackers: [
    CorePerformanceTrackers.RobotToGoalDistanceTracker,
    CorePerformanceTrackers.PucksOutsideGoalTracker,
    CorePerformanceTrackers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 20000,
  timeStep: 1000
};
```

Below are the main parameters that should be preset:
- simConfigs: a list of configuration objects that describe different simulation scenarios, each object should include:
  + name: unique name for this scenario, will be used to refer to this scenario in the benchmarking graphs.
  + simConfig: a simulation configuration object that should adhere to the specifications described in the previous section, not all parameters should be specified here, only the ones that separate this scenario from the main simulation scenario.
  These differences can be simple such as changing the defined static objects, number or radius of robots, number of puck groups or the number or radius of the pucks; or they can be more specific such as comparing different controllers or even changing specific parameters for the same controller. Any property in the main simulation configuration can be overriden here.
- timeStep: minimum reported time step in the graphs
- maxTimeStep: length of each simulation run while benchmarking
- trackers: list of special classes that describe the performance of the algorithm being simulated by providing a function to calculate performance metric at each simulation update, for more check out the definitions of the default trackers in the 'src/common/benchmarking/performanceTrackers' folder.
