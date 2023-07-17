# User Interface

*** TODO: add screenshot of full app ***

## Quick Actions

The quick action section contains the scene selector at the top which shows all available scenes configured in SwarmJS and a direct link &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/link.svg" width="10" height="10">&nbsp; to the current scene.

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

- Options: 
  - Render Skip: Fine tune the number of simulation steps per rendered frame.
  - Rendering Options: Enables / disables rendering for specific elements in the simulations. These options are auto generated using the 'type' property in the renderable definition. More information about renderable definitions is available in the [rendering reference](./rendering-reference.md).

- Configuration: 
  - Dynamic Configurations: changes configurations that immediately take effect such as adding robots or pucks while the simulation is running
  - Static Configurations: changes static configurations that take effect when the scene is restarted, but offer more options such as changing environment size, robot radius, or puck radius.
  - Full Scene Configuration: shows the full scene configurations (read only).

- Benchmark: allows starting and stopping benchmarking the current scene and automatically generates performance graphs according the benchmarking configuration and performance trackers. More information about benchmarking configurations is available in the [Configuration Reference](./configuration-reference.md).

- Controller: allows dynamically writing and deploying robot controllers directly from the browser when supported by the scene. More information about writing controllers in the browser is available in the [Basics Tutorial](./basics-tutorial.md).

- Debug: allows debugging the simulation by retrieving the complete scene state using the &nbsp;<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.x/svgs/solid/sync.svg" width="10" height="10">&nbsp; refresh button.