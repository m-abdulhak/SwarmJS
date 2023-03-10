// Define and Export Renderables:
// ===============================
// This is where we define renderables in a simple config format
// We should also import and register the renderables into renderering module (renderer.js)
// This maybe more suitable to be in a separate file,
// but for now I'm keeping each module's renderables in the same file
// Some of the syntax might not be very clean, such as requiring knowing where stuff are defined
// and stored within the Scene and defining them with a sceneProp, but I think it's fine for now
// ===============================
// type: mandatory, used for grouping renderables into UI buttons to enable/disable rendedering them
// svgClass: optional, used to add classes to the svg elements, useful for debugging
// dataPoints: optional, defines the data points if the renderable is repeated for multiple objects
//             dataPoints are usually defined as a property of the scene with the 'sceneProp' key
//             If no dataPoints are defined, only 'sceneProp' can be used throughout the renderable
// shape: mandatory, svg shape to be rendered
// staticAttrs: optional, defines the attributes to be set only once when the element is initialized
// styles: optional, defines the styling attributes for the element, also only applied once
// dynamicAttrs: optional, defines the attributes to be set on every simulation update
// drag: optional, defines the draggable behavious for the element throuhg the following properties:
//   - prop: the property of the datapoint to be set using the element drag event when dragging
//   - pause: whether the simulation should be paused when dragging
//   - onStart / onEnd: define the actions to be performed when dragging starts and ends
//        - styles: defines the styles to set when dragging starts / ends
//        - log: defines the attributes to be logged to console when dragging starts / ends
//   - onDrag: defines the actions to be performed when dragging
//        - log: defines the attributes to be logged to console when dragging is in progress

// Any property can be one of the following:
// - string / number: the value is set directly
// - prop: the value is parsed as a property of the datapoint
//          a 'modifier' function can be defined to modify the value after it is parsed
// - sceneProp: the value is parsed as a property of the scene
//          a 'modifier' function can be defined to modify the value after it is parsed
// - special: used for special behaviors, such as setting a color according to the color schema
//            currenly only 'schemaColor' is supported

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
      cx: { prop: 'sensors.position.x' },
      cy: { prop: 'sensors.position.y' }
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
  }
];

const sensorsRenderables = [
  /*
    {
      type: 'Sensor',
      svgClass: 'wall-sensor',
      desc: 'Sensor',
      shape: 'circle',
      dataPoints: { sceneProp: 'robots' },
      staticAttrs: {
        r: {
          prop: 'radius'
          // modifier: (val) => val * 0.4
        },
        id: { prop: 'id' }
      },
      dynamicAttrs: {
        fill: {
          prop: 'sensors.walls',
          modifier: (val) => (val.includes('left') ? 'green' : 'red')
        },
        cx: { prop: 'sensors.directions.left.x' },
        cy: { prop: 'sensors.directions.left.y' }
      },
      styles: {
        fill: 'none',
        'fill-opacity': 0,
        'stroke-width': 2,
        'stroke-opacity': 1
      }
    },
    {
      type: 'Sensor',
      svgClass: 'wall-sensor',
      desc: 'Sensor',
      shape: 'circle',
      dataPoints: { sceneProp: 'robots' },
      staticAttrs: {
        r: {
          prop: 'radius'
          // modifier: (val) => val * 0.4
        },
        id: { prop: 'id' }
      },
      dynamicAttrs: {
        fill: {
          prop: 'sensors.walls',
          modifier: (val) => (val.includes('right') ? 'green' : 'red')
        },
        cx: { prop: 'sensors.directions.right.x' },
        cy: { prop: 'sensors.directions.right.y' }
      },
      styles: {
        fill: 'none',
        'fill-opacity': 0,
        'stroke-width': 2,
        'stroke-opacity': 1
      }
    },
    */
  {
    type: 'Sensor',
    svgClass: '',
    desc: 'Front Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: {
        prop: 'radius',
        modifier: (val) => val * 0.4
      },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: {
        prop: 'sensors.fields.readings.heatMap.forward',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${255 - val[0]}, ${255 - val[1]}, ${255 - val[2]})`;
          return res;
        }
      },
      fill: {
        prop: 'sensors.fields.readings.heatMap.forward',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${val[0]}, ${val[1]}, ${val[2]})`;
          return res;
        }
      },
      cx: { prop: 'sensors.fields.sensingPoints.forward.x' },
      cy: { prop: 'sensors.fields.sensingPoints.forward.y' }
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
    desc: 'Other Robots',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: {
        prop: 'radius',
        modifier: (val) => val * 2
      },
      id: { prop: 'id' },
      stroke: 'none'
    },
    dynamicAttrs: {
      fill: {
        prop: 'sensors.otherRobots',
        modifier: (val) => (val ? 'rgba(255,0,0,0.5)' : 'rgba(0,255,0,0.2)')
      },
      cx: { prop: 'sensors.directions.forward.x' },
      cy: { prop: 'sensors.directions.forward.y' }
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
    type: 'Text',
    svgClass: 'robot-number-text',
    desc: 'Text',
    shape: 'text',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      text: {
        prop: 'id'
      },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      x: { prop: 'sensors.directions.right.x' },
      y: { prop: 'sensors.directions.right.y' },
      text: {
        prop: 'sensors.fields.readings.heatMap.forward',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = val[0] + val[1] + val[2];
          return res;
        }
      }
    },
    styles: {
      'text-anchor': 'middle',
      'font-size': 20,
      fill: 'black',
      stroke: 'grey',
      'stroke-width': 1
    }
  }
];

export default [
  ...sensorsRenderables,
  ...bodyRenderables
];