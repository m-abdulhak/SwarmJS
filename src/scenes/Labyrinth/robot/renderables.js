/* eslint-disable no-undef */
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
      fill: { prop: 'color' },
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
  },
  {
    type: 'Body',
    svgClass: 'robot-tail',
    desc: 'Tail',
    shape: 'polygon',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      stroke: 'none'
    },
    dynamicAttrs: {
      points: { prop: 'tailBody.vertices',
        modifier: (vertices) => {
          const outputArray = [];
          for (const [, point] of Object.entries(vertices)) {
            outputArray.push([point.x, point.y]);
          }
          return outputArray;
        } }
    },
    styles: {
      fill: { prop: 'color' },
      stroke: 'black',
      'fill-opacity': 0,
      'stroke-width': 1,
      'stroke-opacity': 1
    }
  },
  {
    type: 'Push Direction',
    svgClass: '',
    desc: 'Relative Goal Heading',
    dataPoints: { sceneProp: 'robots' },
    shape: 'path',
    staticAttrs: {
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      points: [
        { prop: 'sensors.position' },
        { prop: 'sensors.goalVis',
          modifier: (goal) => (goal || sensors.position) }
      ]
    },
    styles: {
      fill: 'none',
      stroke: 'pink',
      'stroke-width': 4,
      'stroke-opacity': 1,
      'fill-opacity': 1
    }
  }
];

const sensorsRenderables = [
  {
    type: 'Field Sensors',
    svgClass: '',
    desc: 'Left Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: 2,
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: 'none',
      fill: 'purple',
      cx: { prop: 'sensors.fields.sensingPoints.left.x' },
      cy: { prop: 'sensors.fields.sensingPoints.left.y' }
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
    type: 'Field Sensors',
    svgClass: '',
    desc: 'Centre Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: 2,
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: 'none',
      fill: 'purple',
      cx: { prop: 'sensors.fields.sensingPoints.centre.x' },
      cy: { prop: 'sensors.fields.sensingPoints.centre.y' }
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
    type: 'Field Sensors',
    svgClass: '',
    desc: 'Right Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: 2,
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: 'none',
      fill: 'purple',
      cx: { prop: 'sensors.fields.sensingPoints.right.x' },
      cy: { prop: 'sensors.fields.sensingPoints.right.y' }
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
    type: 'Field Sensors',
    svgClass: '',
    desc: 'Edge Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: 2,
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: 'none',
      fill: 'pink',
      cx: { prop: 'sensors.fields.sensingPoints.edge.x' },
      cy: { prop: 'sensors.fields.sensingPoints.edge.y' }
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
    type: 'Other Robots Sensor',
    svgClass: '',
    desc: 'Robot Ahead Sensor',
    shape: 'polygon',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      stroke: 'none'
    },
    dynamicAttrs: {
      stroke: {
        prop: 'sensors.polygons.ahead.reading.robots',
        modifier: (val) => (val ? 'white' : 'none')
      },
      fill: 'rgb(255, 255, 0, 0.25)',
      points: { prop: 'sensors.polygons.ahead.vertices' }
    },
    styles: {
      fill: 'none',
      stroke: 'black',
      'fill-opacity': 0,
      'stroke-width': 2,
      'stroke-opacity': 1
    }
  },
  {
    type: 'State',
    svgClass: 'robot-number-text',
    desc: 'State',
    shape: 'text',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      text: {
        prop: 'id'
      },
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      x: { prop: 'sensors.position.x' },
      y: { prop: 'sensors.position.y', modifier: (val) => val + 30 },
      text: {
        prop: 'sensors.state',
        modifier: (val) => val
      }
    },
    styles: {
      'text-anchor': 'middle',
      'font-size': 12,
      fill: 'white',
      stroke: 'none',
      'stroke-width': 1
    }
  }
];

const nSensorRegions = 8;
const circleSensors = [];

// eslint-disable-next-line no-plusplus
for (let i = 0; i < nSensorRegions; ++i) {
  circleSensors.push({
    type: 'Puck Sensors',
    svgClass: '',
    desc: `${i} Circle Sensor`,
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: {
        prop: `sensors.circles.index${i}.radius`
      },
      id: { prop: 'id' },
      stroke: 'black'
    },
    dynamicAttrs: {
      fill: 'rgba(127,255,127,0.25)',
      stroke: {
        prop: `sensors.circles.index${i}.reading`,
        modifier(val) {
          if (val.pucks > 0) {
            return 'white';
          }
          return 'none';
        }
      },
      cx: { prop: `sensors.circles.index${i}.centre.x` },
      cy: { prop: `sensors.circles.index${i}.centre.y` }
    },
    styles: {
      fill: 'none',
      stroke: 'none',
      'fill-opacity': 0,
      'stroke-width': 2,
      'stroke-opacity': 1
    }
  });
}

export default [
  ...bodyRenderables,
  ...sensorsRenderables,
  ...circleSensors
];
