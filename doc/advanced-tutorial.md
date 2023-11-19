# Advanced Tutorial: Creating New Scenes

In this tutorial, we will create a new scene and re-implement the simple clustering algorithm to found in the [Cluster (Periphery)](https://m-abdulhak.github.io/SwarmJS/?scene=peripheryCluster) scene.

This tutorial will only work by cloning the project and running it locally as it requires code changes, you should make sure that you followed the steps outlined in the 'Installation' section in the main [README](../README.md) file and that the simulator is available on http://localhost:8080/ , you can also familiarize yourself with the code structure by reading through the [Code Structure tutorial](./code-structure.md).

### Creating a New Scene

First, create a new folder under the 'src/scenes' folder and name it 'myScene'. Then create a new file under the 'myScene' folder and name it 'index.js'. This file will contain the code for the scene, and will be loaded automatically by the simulator when the scene is selected from the scene selector.

The 'index.js' file should always export a default object containing all the properties and configurations `SwarmJS` needs to run the scene. The object should have the following shape: 
```js
export default {
  title: 'My Scene',
  name: 'myScene',
  simConfig,
  benchmarkConfig,
  description: {
    html: 'My scene description'
  }
};
```

The title, name, and description properties are used to display information about the scene in the UI such as the scene selector.

The simConfig and benchmarkConfig properties are used to configure the simulation and benchmarking respectively. We will discuss the simConfig and benchmarkConfig properties in more details in the [Configuration Reference](./configuration-reference.md) section, but let's define simple configurations for now. Add the following variables to the file:
```js
import {
  CoreSensors,
  CorePositionsGenerators,
  CorePerformanceTrackers
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import RobotRenderables from '@common/robot/renderables';

const simConfig = {
  env: {
    width: 600,
    height: 400,
    renderSkip: 1
  },
  robots: {
    count: 1,
    radius: 4,
    controllers: {
      velocity: {
        controller: (robot) => ((sensors, actuators) => ({
          linearVel: 0,
          angularVel: 0,
          type: robot.SPEED_TYPES.RELATIVE
        }))
      },
      supportsUserDefinedControllers: false
    },
    sensors: [...Object.values(CoreSensors)],
    actuators: [],
    useVoronoiDiagram: false
  },
  pucks: {
    groups: [
      {
        id: 0,
        count: 1,
        radius: 8,
        color: 'red'
      }
    ],
    useGlobalPuckMaps: false
  },
  objects: [],
  positionsGenerator: CorePositionsGenerators.randomCollisionFree,
  renderables: [
    { module: 'Scene', elements: SceneRenderables },
    { module: 'Puck', elements: PuckRenderables },
    { module: 'Robot', elements: RobotRenderables }
  ]
};

const benchmarkConfig = {
  simConfigs: [
    {
      name: '5 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          count: 5
        }
      }
    },
    {
      name: '30 Robots',
      simConfig: {
        env: {
          renderSkip: 50
        },
        robots: {
          count: 30
        }
      }
    }
  ],
  trackers: [
    CorePerformanceTrackers.MinRobotRobotDistanceTracker
  ],
  maxTimeStep: 20000,
  timeStep: 100
};

```

This configuration defines a simple scene, the object has three configuration properties: env, robots, and pucks.

#### env
The env property defines the size of the environment, the renderSkip property defines the number of time steps to skip between rendering frames, this is useful for speeding up the simulation when the number of robots and pucks is large.

#### robots
The robots property defines:
- count:

  number of robots

- radius:

  radius of each robot

- controllers:

  the controller is defined as a higher-order function (a function that returns a function), the outer function is only run once for each robot (at the start of the simulation), it can be used to initialize  the robot with any variables that will be accessible to the controller throughout the simulation, and the inner function is run at each time step for each robot, it receives the current values for the robot sensors and actuators and returns the robot velocity. The controller function also has access to the robot object, which can be used to access the any other property in the robot, such as the robot's SPEED_TYPES object, which defines the speed types supported by SwarmJS. 
  The controller function also has access to the 'params' object, which contains the parameters defined in the 'params' property of the scene object. The specified velocity object should include the following properties: linearVel, angularVel, and type.

- sensors: 

  an array of sensors to be attached to each robot, commonly used sensors are defined in the '@common' package in `SwarmJS` under 'CoreSensors'.

- actuators: 

  an array of actuators to be attached to each robot, commonly used actuators are defined in the '@common' package in `SwarmJS` under 'CoreActuators'. We will not be using any actuators in this scene.

- useVoronoiDiagram: 

  a boolean value that specifies whether to use the Voronoi diagram, we will not be using this feature in this scene.

#### pucks
The pucks property defines:

- groups: an array of puck groups, each group has the following properties:
  - id: a unique id for the group
  - count: number of pucks in the group
  - radius: radius of each puck in the group
  - color: color of each puck in the group

- useGlobalPuckMaps: a boolean value that specifies whether to use global puck maps, we will not be using this feature in this scene.

#### objects
The objects property defines an array of static objects in the scene, we will not be adding any static obstacles in this scene.

#### positionsGenerator
The positionsGenerator property defines the function used to generate the initial positions of the robots and pucks. commonly used positions generators are defined in the '@common' package in `SwarmJS` under 'CorePositionsGenerators'.

#### renderables
The renderables property is an array that defines all the rendering configuration for the scene, this topic is discussed in more details in the [Rendering Reference](./rendering-reference.md).

All renderables (such as static obstacles, robot body, robot sensors,... ) should be registered in this list and assigned a module property. `SwarmJS` will generate all the required code to render these properties and will add a UI toggle in the 'Rendering' page that allows properties that share the same tag to be disabled/enabled independently.

For this scene, we will only be using the default renderables defined in each of the three modules: Scene, Puck, and Robot.

### Registering The New Scene

The final step is to register the new scene in the 'src/scenes/index.js' file, which defines all the scenes that are injected into the simulator. Import the new scene configurations and add the scene to the list of exported scenes as follows:
```js
import myScene from './MyScene';

export default {
  ..., // other scenes
  myScene
};
```

Now you can run the simulator and select the new scene will show up in the scene selector, you should see a single robot and a single puck in the scene, neither of which are moving, but you can still interact with them and move them around using the mouse, as these interactions are defined in the default renderables we used in the scene.

The next step will be adding the controller code to implement the clustering algorithm.

### Changing robot behavior

As discussed earlier the controller is defined as a higher-order function (a function that returns a function). We can modify the robot controller in two ways:
- Initialize: This can be done by modifying the outer function, which gets executed once for each robot when the simulation starts, and offers the ability to set the initial state for the robot and to define constants, variables, and functions that can be used in the controller.
- Loop: This can be done by modifying the inner function, this function gets executed for each robot at every time step in the simulation. It has access to the robot's sensors and actuators as well as access to all the constants, variables, and functions defined in the initialization step. It can also access the robot using the 'robot' object and the entire scene using the 'robot.scene' object.

First we will use the initialization step to  define two constants for specifying the maximum forward and angular speeds. Modify the code in the 'Initialize' section to be:
```js
velocity: {
  controller: (robot) => {
    const maxAngularSpeed = 0.015;
    const maxForwardSpeed = 0.2;

    return (sensors, actuators) => ({
      linearVel: 0,
      angularVel: 0,
      type: robot.SPEED_TYPES.RELATIVE
    });
  }
}
```

Then we will do the following steps in the loop function:
- detect the number of pucks on the left side of the robot using the 'polygons' sensors provided by SwarmJS
- set the angular speed of the robot to be the 'maxAngularSpeed' to the left (negative) if there are any pucks detected by the sensor on the left side of the robot or to the right (positive) otherwise
- set the forward speed as the 'maxForwardSpeed' and send the new speeds to the robot as relative speeds by setting the appropriate velocity properties in the return value of the loop function as follows:
  ```js
  velocity: {
    controller: (robot) => {
      const maxAngularSpeed = 0.015;
      const maxForwardSpeed = 0.2;

      return (sensors, actuators) => {
        const leftPucks = sensors.polygons.left.reading.pucks;
        const angularSpeed = leftPucks > 0 ? -maxAngularSpeed : maxAngularSpeed;

        return {
          linearVel: maxForwardSpeed,
          angularVel: angularSpeed,
          type: robot.SPEED_TYPES.RELATIVE
        };
      };
    }
  }
  ```

This controller code uses the 'polygons' sensor, which is not part of the 'CoreSensors' we used in this scene, but is provided by `SwarmJS` under 'ExtraSensors'. So we should enable it with these steps:
- Add 'ExtraSensors' to the list of imports at the top of the file:
  ```js
  import {
    CoreSensors,
    ExtraSensors,
    CorePositionsGenerators,
    CorePerformanceTrackers
  } from '@common';
  ```

- Add the 'polygons' sensor to the list of sensors attached to the robot as follows:
  ```js
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
  ]
  ```

  The 'polygons' sensor is used to detect the number of objects in a region defined by a set of vertices. The vertices can be defined in either polar or cartesian coordinates. We can specify the regions and types of objects to detect inside the 'params' property of the sensor.

  In this case, we defined a single region named 'left' that is defined by three vertices, the first two vertices are defined in polar coordinates and the third vertex is defined in cartesian coordinates. The 'sensedTypes' property specifies the types of objects to be detected in the region, in this case, we are only interested in detecting pucks. We can then get the 'pucks' reading, which is the number of pucks detected by the sensor inside the specified region relative to the robot (on the left of the robot in this case).


Lastly, we should increase the number of robots to ~10 and pucks to ~100 (or any other values you see fit).

These should be all the changes needed to get the algorithm working, refresh the page and you should see the robots moving around the pucks and clustering them in the center of the environment, but the robots will be moving very slowly, we can either change the maximum velocities defined in the controller, or we can add support for dynamically changing the robots' speed from the UI directly.

### Adding Dynamic Configurations

This can be done by adding a 'velocity' slider in the Dynamic Configurations panel, the configuration for this slider is available in the '@common' package in `SwarmJS` under 'defaultDynamicPropertyDefinitions.velocityScale'.

To enable this slider we need to make two changes:

- Import the 'defaultDynamicPropertyDefinitions.velocityScale' and pass it to the scene under the 'dynamicPropertyDefinitions' property in the scene configuration object:
  ```js
  import {
    CoreSensors,
    ExtraSensors,
    CorePositionsGenerators,
    CorePerformanceTrackers,
    defaultDynamicPropertyDefinitions
  } from '@common';

  const simConfig = {
    // ... other configurations
    dynamicPropertyDefinitions: [
      defaultDynamicPropertyDefinitions.velocityScale
    ]
  };
  ```

  Tip: You can also add other dynamic properties to the scene by adding them to the 'dynamicPropertyDefinitions' array such as the 'defaultDynamicPropertyDefinitions.robotCount' which allows dynamically changing the number of robots in the scene, or the 'defaultDynamicPropertyDefinitions.pucksCountG1' which allows dynamically changing the number of pucks in the first group, or you can even define your own dynamic properties by following the same structure as the ones defined in the 'defaultDynamicPropertyDefinitions'.

- Update the controller function to use the 'velocityScale' property in the robot as follows:
  ```js
  (sensors, actuators) => {
    const leftPucks = sensors.polygons.left.reading.pucks;
    const angularSpeed = leftPucks > 0 ? -maxAngularSpeed : maxAngularSpeed;

    return {
      linearVel: maxForwardSpeed * robot.velocityScale,
      angularVel: angularSpeed * robot.velocityScale,
      type: robot.SPEED_TYPES.RELATIVE
    };
  }
  ```

With these changes, the algorithm should be working as expected, and a 'Velocity' slider should be available in the 'Dynamic Configurations' panel that allows changing the robots' speed dynamically.


### Benchmarking

The benchmarkConfig variable we defined earlier is used to configure the benchmarking process, it defines the different simulation configurations to benchmark, the performance trackers to use, and the duration of each benchmark run. You can run the benchmarking process by clicking the 'Benchmark' button in the quick actions menu, or by clicking the 'Start Benchmark' button in the 'Benchmark' page.

Each configuration in the 'simConfigs' array defines a set of configurations to benchmark, each configuration has a name and a simConfig property, the name is used to identify the configuration in the benchmarking graph, and the simConfig property is used to define the configuration that will overwrite the default simulation configuration, it can change any of the configurations we discussed earlier, such as the number of robots, number of pucks, controller code, sensor parameters, etc.

The 'trackers' property defines the performance trackers to use, commonly used trackers are defined in the '@common' package in `SwarmJS` under 'CorePerformanceTrackers', but you can also define your own trackers by following the same structure as the ones defined in the 'CorePerformanceTrackers' module.

The performance trackers are used to track the performance of the algorithm over time, they can be used to track any metric, such as the number of pucks clustered, the number of robots clustered, the number of collisions, the number of times the algorithm failed, etc. The trackers are run at each time step and can access the robot and the scene to get the required information.

Each tracker generates separate graph in the benchmarking page, and each graph contains multiple lines, each line represents one of the benchmarking configurations defined in the 'simConfigs', and each point in the line represents the value of the metric tracked by the tracker at a specific time step.

The 'maxTimeStep' property defines the maximum number of time steps to run the simulation for each simulation run, and the 'timeStep' property defines the time interval between consecutive points in the graph.

In this scene we used the 'MinRobotRobotDistanceTracker' to track the minimum distance between any two robots in the scene, and we defined two configurations to benchmark, one with 5 robots and one with 30 robots.

Challenge: This tracker does not provide useful information for measuring performance in this particular algorithm. Try to define your own trackers to track the number of clustered pucks, or the total distance between pucks, or any other metric you see fit by creating new trackers and following the same structure used by the trackers found in the 'CorePerformanceTrackers'.

### Overriding the Default Rendering

You might notice the the scene is rendering extra elements such as the robot's 'goal' and 'waypoint' that are not part of the scene. These elements are defined in the default renderables we used in the scene, and can be disabled by overriding the 'Robot' renderable.

We can do this be defining a new robot renderables array:
```js
const MyRobotRenderables = [
  {
    type: 'Body',
    svgClass: 'robot-body',
    dataPoints: { sceneProp: 'robots' },
    shape: 'circle',
    staticAttrs: {
      r: { prop: 'radius' },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      cx: { prop: 'sensors.position.x' },
      cy: { prop: 'sensors.position.y' }
    },
    styles: {
      fill: { prop: 'color' },
      stroke: 'black',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    },
    drag: {
      prop: 'position',
      pause: true,
      onStart: {
        styles: {
          stroke: 'green'
        },
        log: [
          { prop: 'sensors' }
        ]
      },
      onEnd: {
        styles: {
          stroke: 'black'
        }
      }
    }
  },
  {
    type: 'Body',
    svgClass: 'robot-orientation',
    desc: 'Line segments between robots and headings',
    dataPoints: { sceneProp: 'robots' },
    shape: 'path',
    staticAttrs: {
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      points: [
        { prop: 'sensors.position' },
        { prop: 'sensors.heading' }
      ]
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'stroke-width': 2,
      'stroke-opacity': 1,
      'fill-opacity': 1
    }
  },
  {
    type: 'Sensor',
    svgClass: '',
    desc: 'Left Polygon Puck Sensor',
    shape: 'polygon',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      stroke: 'none'
    },
    dynamicAttrs: {
      fill: 'rgb(0, 0, 255, 0.15)',
      points: { prop: 'sensors.polygons.left.vertices' }
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'fill-opacity': 0,
      'stroke-width': 1,
      'stroke-opacity': 1
    }
  }
];
```
Then replace the 'Robot' renderable in the 'renderables' array with the new renderables array:
```js
renderables: [
  { module: 'Scene', elements: SceneRenderables },
  { module: 'Puck', elements: PuckRenderables },
  { module: 'Robot', elements: MyRobotRenderables }
]
```

The new renderables array defines three renderables:
- Body: This renderable is used to render the robot body, it is defined in the same way as the default robot body renderable, it has the following properties:
  - type: This property defines the type of the renderable, this is used to group renderables that share the same type within each module and disable/enable them with a single switch in the 'Rendering' page.
  - svgClass: This property defines the class of the svg element used to render the renderable.
  - dataPoints: This property defines the data points used for rendering, each value in the data points will correspond to one element being rendered into the scene, and will be used as the base object to access the values of all props defined in the 'staticAttrs', 'dynamicAttrs', and 'styles'. The data points will most likely be a scene property, such as the robots, the pucks, or the static objects in the scene; in this case, we are using the 'robots' property of the scene, so for each robot, one element will be rendered as defined by this renderable configuration.
  - shape: This property defines the shape of the renderable, it can be 'circle', 'path', or 'polygon', or other.
  - staticAttrs: This property defines the static attributes of the renderable, these attributes are set once when the renderable is created and do not change afterwards.
  - dynamicAttrs: This property defines the dynamic attributes of the renderable, these attributes are updated at each time step.
  - styles: This property defines the styles of the renderable, these styles are set once when the renderable is created and do not change afterwards.
  - drag: This property defines the drag behavior of the renderable, it can be used to enable/disable dragging the renderable with the mouse, it can also be used to define styles that are applied when the drag starts and ends, and logs that are written to the developer console (useful for debugging).
- Orientation: This renderable is used to render the robot orientation, it is defined in the same way as the default robot orientation renderable.
- Sensor: This renderable is used to render the 'polygons' sensor, it is defined in the same way as the default 'polygons' sensor renderable.

### Conclusion

By now the scene you created should be identical to the [Cluster (Periphery)](https://m-abdulhak.github.io/SwarmJS/?scene=peripheryCluster) scene, and you should now have a better understanding of how to create new scenes and how to modify existing scenes.

There are still a lot of features and capabilities in `SwarmJS` that we did not cover in this tutorial, but you should now have a good understanding of the main concepts and should be able to explore the rest of the scenes on your own.

So make sure to check out the other tutorials and the [Configuration Reference](./configuration-reference.md) and [Rendering Reference](./rendering-reference.md) and to play around with the other scenes to get a better understanding of what `SwarmJS` can do.

Thank you for reading this tutorial, and I hope you enjoy using `SwarmJS` as much as I enjoyed developing it.

