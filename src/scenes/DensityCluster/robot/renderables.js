// Define and Export Renderables:
// ===============================
// This is where we define renderables in a simple config format
// We should also import and register the renderables into rendering module (renderer.js)
// This maybe more suitable to be in a separate file,
// but for now I'm keeping each module's renderables in the same file
// Some of the syntax might not be very clean, such as requiring knowing where stuff are defined
// and stored within the Scene and defining them with a sceneProp, but I think it's fine for now
// ===============================
// type: mandatory, used for grouping renderables into UI buttons to enable/disable rendering them
// svgClass: optional, used to add classes to the svg elements, useful for debugging
// dataPoints: optional, defines the data points if the renderable is repeated for multiple objects
//             dataPoints are usually defined as a property of the scene with the 'sceneProp' key
//             If no dataPoints are defined, only 'sceneProp' can be used throughout the renderable
// shape: mandatory, svg shape to be rendered
// staticAttrs: optional, defines the attributes to be set only once when the element is initialized
// styles: optional, defines the styling attributes for the element, also only applied once
// dynamicAttrs: optional, defines the attributes to be set on every simulation update
// drag: optional, defines the draggable behavior for the element through the following properties:
//   - prop: the property of the data point to be set using the element drag event when dragging
//   - pause: whether the simulation should be paused when dragging
//   - onStart / onEnd: define the actions to be performed when dragging starts and ends
//        - styles: defines the styles to set when dragging starts / ends
//        - log: defines the attributes to be logged to console when dragging starts / ends
//   - onDrag: defines the actions to be performed when dragging
//        - log: defines the attributes to be logged to console when dragging is in progress

// Any property can be one of the following:
// - string / number: the value is set directly
// - prop: the value is parsed as a property of the data point
//          a 'modifier' function can be defined to modify the value after it is parsed
// - sceneProp: the value is parsed as a property of the scene
//          a 'modifier' function can be defined to modify the value after it is parsed
// - special: used for special behaviors, such as setting a color according to the color schema
//            currently only 'schemaColor' is supported

// Example of rendering a compound body
// const compoundBodyRenderables = [
//   {
//     type: 'Body',
//     svgClass: 'robot-body',
//     dataPoints: { sceneProp: 'robots' },
//     shape: 'circle',
//     staticAttrs: {
//       r: { prop: 'radius' },
//       id: { prop: 'id' }
//     },
//     dynamicAttrs: {
//       cx: { prop: 'body.parts[1].position.x' },
//       cy: { prop: 'body.parts[1].position.y' }
//     },
//     styles: {
//       fill: '#FFC53A',
//       'stroke-width': 1,
//       'stroke-opacity': 1,
//       'fill-opacity': 1
//     },
//     drag: {
//       prop: 'position',
//       pause: true,
//       onStart: {
//         styles: {
//           stroke: 'green'
//         },
//         log: [
//           { prop: 'sensors' }
//         ]
//       },
//       onEnd: {
//         styles: {
//           stroke: 'black'
//         }
//       }
//     }
//   },
//   {
//     type: 'Body',
//     svgClass: 'robot-body',
//     dataPoints: { sceneProp: 'robots' },
//     shape: 'polygon',
//     staticAttrs: {
//     },
//     dynamicAttrs: {
//       points: {
//         prop: 'body.parts[2].vertices',
//         modifier: (vertices) => vertices.map((p) => `${p.x},${p.y}`).join(' ')
//       }
//     },
//     styles: {
//       fill: '#FFC53A',
//       'stroke-width': 1,
//       'stroke-opacity': 1,
//       'fill-opacity': 1
//     },
//     drag: {
//       prop: 'position',
//       pause: true,
//       onStart: {
//         styles: {
//           stroke: 'green'
//         },
//         log: [
//           { prop: 'sensors' }
//         ]
//       },
//       onEnd: {
//         styles: {
//           stroke: 'black'
//         }
//       }
//     }
//   }
// ];

const bodyRenderables = [
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
      cx: { prop: 'body.position.x' },
      cy: { prop: 'body.position.y' }
    },
    styles: {
      fill: '#FFC53A',
      stroke: 'black',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'fill-opacity': 1
    },
    drag: {
      prop: 'position',
      pause: false,
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
  }
];

const sensorsRenderables = [
  {
    type: 'Sensor',
    svgClass: '',
    desc: 'Left Circle Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: {
        prop: 'sensors.circles.left.radius'
      },
      id: { prop: 'id' },
      stroke: 'black'
    },
    dynamicAttrs: {
      fill: {
        prop: 'sensors.circles.left.reading',
        modifier: (val) => ((val.walls || val.robots) ? 'rgba(255,0,0,0.5)' : 'rgba(0,255,0,0.2)')
      },
      cx: { prop: 'sensors.circles.left.centre.x' },
      cy: { prop: 'sensors.circles.left.centre.y' }
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'fill-opacity': 0,
      'stroke-width': 1,
      'stroke-opacity': 1
    }
  },
  {
    type: 'Sensor',
    svgClass: '',
    desc: 'Right Circle Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: {
        prop: 'sensors.circles.right.radius'
      },
      id: { prop: 'id' },
      stroke: 'black'
    },
    dynamicAttrs: {
      fill: {
        prop: 'sensors.circles.right.reading',
        modifier: (val) => ((val.walls || val.robots) ? 'rgba(255,0,0,0.5)' : 'rgba(0,255,0,0.2)')
      },
      cx: { prop: 'sensors.circles.right.centre.x' },
      cy: { prop: 'sensors.circles.right.centre.y' }
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'fill-opacity': 0,
      'stroke-width': 1,
      'stroke-opacity': 1
    }
  },
  {
      type: 'Sensor',
      svgClass: '',
      desc: 'Inner Polygon Puck Sensor',
      shape: 'polygon',
      dataPoints: { sceneProp: 'robots' },
      staticAttrs: {
          stroke: 'none'
      },
      dynamicAttrs: {
          fill: {
              prop: 'sensors.polygons.inner.reading.pucks',
              modifier: (val) => val ? `rgb(255, 0, 0, ${0.2*val}` : 'rgb(0, 0, 0, 0.1)'
          },
          points: { prop: 'sensors.polygons.inner.vertices' }
      },
      styles: {
          fill: 'none',
          stroke: 'black',
          'fill-opacity': 0,
          'stroke-width': 1,
          'stroke-opacity': 1
      }
  },
  {
      type: 'Sensor',
      svgClass: '',
      desc: 'Outer Polygon Puck Sensor',
      shape: 'polygon',
      dataPoints: { sceneProp: 'robots' },
      staticAttrs: {
          stroke: 'none'
      },
      dynamicAttrs: {
          fill: {
              prop: 'sensors.polygons.outer.reading.pucks',
              modifier: (val) => val ? `rgb(255, 0, 0, ${0.2*val}` : 'rgb(0, 0, 0, 0.1)'
          },
          points: { prop: 'sensors.polygons.outer.vertices' }
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

export default [
  ...sensorsRenderables,
  ...bodyRenderables
];
