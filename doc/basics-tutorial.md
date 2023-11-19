# Basics Tutorial: Writing Controllers In the Browser

In this tutorial, we will apply a simple clustering algorithm to the [empty scene](https://m-abdulhak.github.io/SwarmJS/?scene=emptyScene), to create a scene similar to the [Cluster (Periphery)](https://m-abdulhak.github.io/SwarmJS/?scene=peripheryCluster) scene.

You can familiarize yourself with the user interface by reading through the [UI tutorial](./user-interface.md).

### Changing Scene Configuration

First, make sure the Configuration Panels are enabled using the &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/cog.svg" width="10" height="10">&nbsp; icon in the quick actions bar.

Start by opening the 'Configuration' tab, here we can change dynamic configurations that immediately take effect such as adding robots or pucks while the simulation is running, and we can change static configurations that take effect when the scene is restarted, but offer more options such as changing environment size, robot radius, or puck radius.

We will starting by increasing the size of the environment and adding more robots and pucks to the scene. We want our changes to persist through simulation restarts, so we will change the settings from the 'Static Configurations' panel.

Use the 'Env Width' slider to set the width of the environment to 600, and the 'Env Height' slider to set the height of the environment to 400.


Then use the 'Robots' and 'Pucks (G1)' sliders to increase the number of robots to 10 and the number of pucks to 100.

Apply these changes by restarting the simulation from the &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/sync.svg" width="10" height="10">&nbsp; icon in the quick actions bar.

Now that we have the scene configured, we will change the controller code for the robots to apply the clustering algorithm.

### Changing robot behavior

Now select the 'Controller' tab, which opens a new panel where we can modify the robot controller in two ways:
- Initialize: This function gets executed once for each robot when the simulations starts, and offers the ability to set the initial state for the robot and to define constants, variables, and functions that can be used in the function as well as in the loop function using the 'CONST', 'VARS', and 'FUNC' objects.
- Loop: This function gets executed for each robot at every time step in the simulation. It has access to the robot's sensors and actuators as well as access to all the constants, variables, and functions defined under the 'CONST', 'VARS', and 'FUNC' objects in the initialization step. It can also access the robot using the 'robot' object and the entire scene using the 'scene' object.

First we will use the initialization step to  define two constants for specifying the maximum forward and angular speeds. Modify the code in the 'Initialize' section to be:
```js
(CONST, VAR, FUNC, robot, params) => {
  CONST.maxAngularSpeed = 0.015;
  CONST.maxForwardSpeed = 0.2;
}
```

Then we will do the following steps in the loop function:

- Detect the number of pucks on the left side of the robot using the 'polygons' sensors provided by `SwarmJS` using the following command:

```js
const leftPucks = sensors.polygons.left.reading.pucks;
```

- Then we will set the angular speed of the robot to be the 'maxAngularSpeed' to the left (negative) if there are any pucks detected by the sensor on the left side of the robot or to the right (positive) otherwise, using the following command:
```js
const angularSpeed = leftPucks > 0 ? -CONST.maxAngularSpeed : CONST.maxAngularSpeed;
``` 

- Then, we will set the forward speed as the 'maxForwardSpeed' and send the new speeds to the robot as relative speeds by setting the following properties in the return value of the loop function:
```js
return {
  linearVel: CONST.maxForwardSpeed,
  angularVel: angularSpeed,
  type: robot.SPEED_TYPES.RELATIVE
};
```
- Finally, we will support dynamically changing the robot speed using the 'velocity' slider in the Dynamic Configurations panel using the 'velocityScale' property in the robot. The full code for the loop function will be as follows:
```js
(sensors, actuators) => {
  const leftPucks = sensors.polygons.left.reading.pucks;
  const angularSpeed = leftPucks > 0 ? -CONST.maxAngularSpeed : CONST.maxAngularSpeed;

  return {
    linearVel: CONST.maxForwardSpeed * robot.velocityScale,
    angularVel: angularSpeed * robot.velocityScale,
    type: robot.SPEED_TYPES.RELATIVE
  };
}
```

Now you can deploy the new code to the robots and restart the scene using the &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/play.svg" width="10" height="10">&nbsp; icon in the controller panel. You can also save the new code to a file using the &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/download.svg" width="10" height="10">&nbsp; icon and reload it later with the &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/upload.svg" width="10" height="10">&nbsp; icon.

The scene is now identical to the [Cluster (Periphery)](https://m-abdulhak.github.io/SwarmJS/?scene=peripheryCluster) scene, but is still missing the visualization of the pucks sensor that is visible in that scene. This can be configured using a [renderable](./rendering-reference.md) configuration, but that can not be done from the browser. You can follow the [advanced tutorial](./advanced-tutorial.md) to learn how to run your own instance of `SwarmJS` and create a new scene, which offers much more flexibility for modifying or extending the simulation.
