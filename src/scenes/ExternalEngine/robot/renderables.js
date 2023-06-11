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
