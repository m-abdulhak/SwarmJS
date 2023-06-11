export default [
  {
    type: 'Obstacles',
    svgClass: 'obstacle',
    dataPoints: {
      sceneProp: 'staticObjects',
      modifier: (list) => list.filter((o) => o.def.type === 'rectangle')
    }, // property of scene
    shape: 'rect',
    staticAttrs: {
      x: { prop: 'left' },
      y: { prop: 'top' },
      width: { prop: 'width' },
      height: { prop: 'height' }
    },
    styles: {
      fill: '#444444'
    }
  },
  {
    type: 'Obstacles',
    svgClass: 'obstacle',
    dataPoints: {
      sceneProp: 'staticObjects',
      modifier: (list) => list.filter((o) => o.def.type === 'circle')
    }, // property of scene
    shape: 'circle',
    staticAttrs: {
      cx: { prop: 'center.x' },
      cy: { prop: 'center.y' },
      r: { prop: 'radius' }
    },
    styles: {
      fill: '#444444'
    }
  }
];
