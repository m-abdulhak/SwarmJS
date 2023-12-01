<h1 align="center" >
SwarmJS: Interactive Swarm Robotics Simulation
</h1>

![mainUI](https://github.com/m-abdulhak/SwarmJS/assets/5468250/8df0998f-d18b-43c2-a09a-dec78cdc28b8)

## About
SwarmJS is an interactive 2D simulation platform developed to prototype, benchmark, and showcase control algorithms for multi robot systems.

Our goal with this project is to create a simple and flexible simulation platform that allows users to easily write and share multi-robot control algorithms. `SwarmJS` is a web application written in JavaScript, and runs completely in the browser. Users can interact with the robots and write control code directly in the browser.
SwarmJS is tailored towards mobile robots operating in the plane and engaged in tasks such as aggregation, object clustering, object sorting, planar construction, and pheromone-guided foraging.

### Built with:
* [Matter.js](https://github.com/liabru/matter-js): Physics engine.
* [D3.js](https://github.com/d3/d3): Rendering. 
* [React](https://github.com/facebook/react): User interface.
* [Material UI](https://github.com/mui/material-ui):  UI components.

## Getting Started

You can start by watching the [video introduction](https://www.youtube.com/watch?v=LUtpTkcM_ZI) or trying `SwarmJS` yourself [here](https://m-abdulhak.github.io/SwarmJS).

Simulations in `SwarmJS` are defined as 'scenes'. A scene defines a set of configurations that describe every detail in the simulation. Multiple scenes are provided in `SwarmJS` to showcase the various capabilities of the simulator, some of which offer the ability to modify the control algorithm directly from the browser while others only enable modifications by cloning the repository and changing the code. Scenes can be selected and run with the scene selector in the quick actions menu.

The latest version of the simulator is available on https://m-abdulhak.github.io/SwarmJS, you can modify, run, and benchmark control algorithms for scenes that support user-defined controllers directly in the browser.

You can also run a local instance with the following steps: 

#### Prerequisites
* Node.js (version 18 or later)
* npm

#### Installation
```sh
git clone https://github.com/m-abdulhak/SwarmJS.git
cd SwarmJS
npm install
npm run dev
```
The simulator should then be available on: http://localhost:8080/

## How to Use
SwarmJS can be used in two ways:

* Directly from the browser:

  In this mode, you can change how the robots behave by modifying the controller code directly in the browser (accessible through the 'Controller' tab). This works in scenes that support user-defined controller code, such as the [demo](https://m-abdulhak.github.io/SwarmJS/?scene=demo) scene provided with SwarmJS.
  In this mode, you can only change the controller code for the robots, and other simple configurations available through the UI, such as the rendering options in the 'Options' tab. You can follow [the basics tutorial](./doc/basics-tutorial.md) to define and run a simple algorithm directly from the browser.

* Define a new scene:

  The full power of `SwarmJS` can be accessed by creating a new scene, which allows changing every detail of the simulation including, but not limited to: environment size, static obstacles, environment background, environment fields, number and size of robots, shape of robots, custom robot controllers, robot sensors (including ones provided by `SwarmJS` or custom sensors defined in the scene), robot actuators (including ones provided by `SwarmJS` or custom actuators defined in the scene), puck groups (including number, size, and color of each group), rendering configuration, benchmarking configuration (including different sets of configuration to benchmark, duration of each benchmark run, and the ability to automatically generate benchmarking graph using performance trackers and graph configuration such as time-step). You can follow [the advanced tutorial](./doc/advanced-tutorial.md) to create and configure a new scene.

## Documentation

The documentation is divided into several sections:
* [User Interface](./doc/user-interface.md)
* [How to Modify Scenes In the Browser](./doc/basics-tutorial.md)
* [How to Create New Scenes](./doc/advanced-tutorial.md)
* [Configuration Reference](./doc/configuration-reference.md)
* [Rendering Reference](./doc/rendering-reference.md)
* [Code Structure and Main Concepts](./doc/code-structure.md)
