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
    desc: 'Left Polygon Puck Sensor',
    shape: 'polygon',
    dataPoints: { sceneProp: 'robots' },
    staticAttrs: {
      stroke: 'none'
    },
    dynamicAttrs: {
      fill: {
        prop: 'sensors.polygons.left.reading',
        modifier: (val) => ((val.robots) ? 'rgba(255,255,0,0.5)' : (val.pucks) ? 'rgba(255,0,0,0.5)' : 'rgba(200,200,200,0.5)')
      },
      points: { prop: 'sensors.polygons.left.vertices' }
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
