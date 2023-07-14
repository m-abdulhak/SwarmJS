export default [
  {
    type: 'Goal',
    svgClass: 'puck-goal',
    dataPoints: { sceneProp: 'pucksGroups' },
    shape: 'circle',
    staticAttrs: {
      r: {
        prop: 'goalRadius'
      },
      fill: { prop: 'color' },
      cx: { prop: 'goal.x' },
      cy: { prop: 'goal.y' }
    },
    dynamicAttrs: {
    },
    styles: {
      'fill-opacity': 0.1,
      'stroke-opacity': 0.1
    }
  },
  {
    type: 'Body',
    svgClass: 'puck-body',
    dataPoints: { sceneProp: 'pucks' },
    shape: 'circle',
    staticAttrs: {
      r: { prop: 'radius' },
      id: { prop: 'id' },
      fill: { prop: 'color' }
    },
    dynamicAttrs: {
      cx: { prop: 'position.x' },
      cy: { prop: 'position.y' }
    },
    styles: {
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
          stroke: 'lightGray'
        },
        log: [
          { prop: 'color' },
          { prop: 'groupGoal' },
          { prop: 'goal' },
          { prop: 'position' },
          { prop: 'velocity' }
        ]
      },
      onEnd: {
        styles: {
          stroke: 'black'
        }
      }
    }
  }
];
