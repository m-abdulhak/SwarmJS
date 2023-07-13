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
  {
    type: 'Sensor',
    svgClass: '',
    desc: 'Left Obstacle Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: {
        prop: 'sensors.circles.leftObstacle.radius'
      },
      id: { prop: 'id' },
      stroke: 'black'
    },
    dynamicAttrs: {
      fill: {
        prop: 'sensors.circles.leftObstacle.reading',
        modifier: (val) => ((val.walls || val.robots) ? 'rgba(255,0,0,0.5)' : 'rgba(0,255,0,0.2)')
      },
      cx: { prop: 'sensors.circles.leftObstacle.centre.x' },
      cy: { prop: 'sensors.circles.leftObstacle.centre.y' }
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
    desc: 'Left Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: 1,
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: {
        prop: 'sensors.fields.readings.heatMap.leftField',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${255 - val[0]}, ${255 - val[1]}, ${255 - val[2]})`;
          return res;
        }
      },
      fill: {
        prop: 'sensors.fields.readings.heatMap.leftField',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${val[0]}, ${val[1]}, ${val[2]})`;
          return res;
        }
      },
      cx: { prop: 'sensors.fields.sensingPoints.leftField.x' },
      cy: { prop: 'sensors.fields.sensingPoints.leftField.y' }
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
    desc: 'Front Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: 1,
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: {
        prop: 'sensors.fields.readings.heatMap.frontField',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${255 - val[0]}, ${255 - val[1]}, ${255 - val[2]})`;
          return res;
        }
      },
      fill: {
        prop: 'sensors.fields.readings.heatMap.frontField',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${val[0]}, ${val[1]}, ${val[2]})`;
          return res;
        }
      },
      cx: { prop: 'sensors.fields.sensingPoints.frontField.x' },
      cy: { prop: 'sensors.fields.sensingPoints.frontField.y' }
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
    desc: 'Right Field Sensor',
    shape: 'circle',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      r: 1,
      id: { prop: 'id' }
    },
    dynamicAttrs: {
      stroke: {
        prop: 'sensors.fields.readings.heatMap.rightField',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${255 - val[0]}, ${255 - val[1]}, ${255 - val[2]})`;
          return res;
        }
      },
      fill: {
        prop: 'sensors.fields.readings.heatMap.rightField',
        modifier: (val) => {
          if (!val) {
            return 'black';
          }
          const res = `rgb(${val[0]}, ${val[1]}, ${val[2]})`;
          return res;
        }
      },
      cx: { prop: 'sensors.fields.sensingPoints.rightField.x' },
      cy: { prop: 'sensors.fields.sensingPoints.rightField.y' }
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
    desc: 'Left Polygon Puck Sensor',
    shape: 'polygon',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      stroke: 'none'
    },
    dynamicAttrs: {
      /*
          stroke: {
              prop: 'sensors.polygons.left.reading.pucks',
              modifier: (val) => val ? `rgb(255, 0, 0, ${0.2*val}` : 'rgb(0, 0, 0, 0.1)'
          },
          */
      fill: 'rgb(255, 255, 255, 0.05)',
      points: { prop: 'sensors.polygons.left.vertices' }
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
    desc: 'Right Polygon Puck Sensor',
    shape: 'polygon',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      stroke: 'none'
    },
    dynamicAttrs: {
      /*
          fill: {
              prop: 'sensors.polygons.right.reading.pucks',
              modifier: (val) => val ? `rgb(255, 0, 0, ${0.2*val}` : 'rgb(0, 0, 0, 0.1)'
          },
          */
      fill: 'rgb(255, 255, 255, 0.05)',
      points: { prop: 'sensors.polygons.right.vertices' }
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
  ...bodyRenderables,
  ...sensorsRenderables
];
