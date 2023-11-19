# Rendering

A configuration-based rendering engine was built on top of [D3.js](https://github.com/d3/d3) to rapidly define renderable elements in the simulation with minimal code.

D3.js is an open-source JavaScript library that provides unparalleled speed and flexibility in creating dynamic, data-driven graphics thanks to its low-level approach built on web standards.

D3 is used directly with web standards such as SVG and Canvas and works by 'joining' a set of data points to a set of DOM elements, then applying operations such as creating, updating, and deleting elements based on the underlying changes to the data, by controlling exactly what happens when the data changes and updating the display in response, allowing for extremely performant updates where only the elements and attributes that need to be changed are modified.

This architecture makes D3 shine for dynamic, interactive visualizations, and is a perfect fit for visualizing the simulation environment based on the underlying changes to the simulation data such as the position of a robot or a puck in the environment or the value of a specific sensor for a robot at each point in time.

Custom-built configuration and rendering engines were built on top of D3.js specifically for SwarmJS to abstract the low-level nature of D3.js, allowing this 'joining' of data and graphics to be done with just a few lines of code to seamlessly visualize and add interactivity to any aspect of the simulation.

Renderables can be defined within any module in the simulator but they should always be imported and registered into the scene configuration as described in the [Advanced Tutorial](./advanced-tutorial.md). Default renderable definitions can be found in the following modules [Scene](../src/common/scene/renderables.js), [Robot](../src/common/robot/renderables.js), and [Puck](../src/common/puck/renderables.js).

Each renderable element can include the following parameters:
- type: mandatory, used for grouping renderables into UI buttons to enable/disable them.
- svgClass: optional, used to add classes to the svg elements
- dataPoints: optional, defines the data points if the renderable is repeated for multiple objects such as robots, pucks, or static objects. DataPoints are usually defined as a property of the scene with the 'sceneProp' key. If dataPoints are defined, `prop` key can be used in the following configurations to refer to properties of the data point object. Otherwise, only 'sceneProp' can be used throughout the renderable definition.
- shape: mandatory, svg shape to be rendered (https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes), or the value 'text' to render text (when using the 'text' shape, use the 'text' property in either staticAttrs
or dynamicAttrs to set the value of the text to be rendered).
- staticAttrs: optional, defines the attributes to be set only once when the element is initialized
- styles: optional, defines the styling attributes for the element, also only applied once, when the element is initialized
- dynamicAttrs: optional, defines the attributes to be set on every simulation update
- drag: optional, defines the draggable behavior for the element through the following properties:
  + prop: the property of the data point to be set using the element drag event when dragging, such as the `position` of the robot
  + pause: whether the simulation should be paused while dragging the element
  + onStart / onEnd: define the actions to be performed when dragging starts and ends
    - styles: defines the styles to set when dragging starts / ends
    - log: defines the attributes to be logged to console when dragging starts / ends
  + onDrag: defines the actions to be performed when dragging
    - log: defines the attributes to be logged to console when dragging is in progress

## Syntax

Any property can be one of the following:
- `string` or `number`: the value is set directly
- `{ prop, modifier }` : the value of `prop` is parsed as a property of the data point, a `modifier` function can be defined to modify the value after it is parsed
- `{ sceneProp }`: the value is parsed as a property of the scene, a `modifier` function can be defined to modify the value after it is parsed
- `{ special }` : used for special behaviors, such as setting a color according to the color schema, currently only `schemaColor` is supported
