export default [{
  type: 'Sensor',
  svgClass: 'puck-sensor',
  desc: 'Sensor',
  shape: 'circle',
  dataPoints: { sceneProp: 'robots' },
  staticAttrs: {
    r: {
      prop: 'radius',
      modifier: (val) => val * 0.8
    },
    id: { prop: 'id' }
  },
  dynamicAttrs: {
    stroke: {
      prop: 'sensors.closestPuckToGrabber',
      modifier: (val) => (val ? 'green' : 'red')
    },
    cx: { prop: 'sensors.directions.forward.x' },
    cy: { prop: 'sensors.directions.forward.y' }
  },
  styles: {
    fill: 'none',
    'fill-opacity': 0,
    stroke: 'green',
    'stroke-width': 2,
    'stroke-opacity': 1
  }
}];
