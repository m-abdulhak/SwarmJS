
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
