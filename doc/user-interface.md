# User Interface

![image](https://github.com/m-abdulhak/SwarmJS/assets/5468250/3b98b489-2064-4b9a-b7ce-d31b754f89b4)


## Quick Actions

The quick action section contains the scene selector at the top which shows all available scenes configured in `SwarmJS` and a direct link &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/link.svg" width="10" height="10">&nbsp; to the current scene.

<p align="center">
  <img src="https://github.com/m-abdulhak/SwarmJS/assets/5468250/1d4f48a1-ba84-45a5-aeb5-2ec40e88e130" height="100">
</p>

The quick actions section contains the following buttons:

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/cog.svg" width="10" height="10">&nbsp; Toggle Configuration Panels: Enables / disables the configuration panels which display more options for rendering configuration, benchmarking, debugging, and more. Disabling these panels can lead to ~2x better performance while the simulation is running.

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/sync.svg" width="10" height="10">&nbsp; Reset Simulation

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/play.svg" width="10" height="10">&nbsp; Pause / Resume simulation

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/draw-polygon.svg" width="10" height="10">&nbsp; Toggle Rendering: Sets the number of simulation steps per rendered frame / disables rendering. Disabling the rendering can lead to 2x better performance while the simulation is running.

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/stopwatch.svg" width="10" height="10">&nbsp; Start / Stop benchmarking and show the number of times the benchmark has finished a simulation run across all provided simulation scenarios.

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/clock.svg" width="10" height="10">&nbsp; Simulation Time

## Simulation

The simulation renderer and a description of the current scene.

## Configuration Panels

This section provides more options for configuring the simulation, including the following panels:

- Rendering: 
  - Render Skip: Fine tune the number of simulation steps per rendered frame.
  - Rendering Options: Enables / disables rendering for specific elements in the simulations. These options are auto generated using the 'type' property in the renderable definition. More information about renderable definitions is available in the [rendering reference](./rendering-reference.md).

![image](https://github.com/m-abdulhak/SwarmJS/assets/5468250/020f924b-7906-4938-a491-d8bd93c74f5f)

- Configuration: 
  - Dynamic Configurations: changes configurations that immediately take effect such as adding robots or pucks while the simulation is running
  - Static Configurations: changes static configurations that take effect when the scene is restarted, but offer more options such as changing environment size, robot radius, or puck radius.
  - Full Scene Configuration: shows the full scene configurations (read only).

![image](https://github.com/m-abdulhak/SwarmJS/assets/5468250/9eeef7b3-6010-4d17-baa5-8617e92f2d77)

- Benchmark: allows starting and stopping benchmarking the current scene and automatically generates performance graphs according the benchmarking configuration and performance trackers. More information about benchmarking configurations is available in the [Configuration Reference](./configuration-reference.md).

![image](https://github.com/m-abdulhak/SwarmJS/assets/5468250/dafffc94-4c36-40ce-a1f3-fb9a2594620d)

- Controller: allows dynamically writing and deploying robot controllers directly from the browser when supported by the scene. More information about writing controllers in the browser is available in the [Basics Tutorial](./basics-tutorial.md).

![image](https://github.com/m-abdulhak/SwarmJS/assets/5468250/15957dd7-362a-400b-b44b-3e3d58bd40b3)

- Debug: allows debugging the simulation by retrieving the complete scene state using the &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/sync.svg" width="10" height="10">&nbsp; refresh button or by watching specific properties.

![image](https://github.com/m-abdulhak/SwarmJS/assets/5468250/14e9a169-3c90-401f-b449-25639b37fc8a)

