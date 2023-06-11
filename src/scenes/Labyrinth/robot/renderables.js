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
            fill: 'rgb(0, 255, 0, 1.0)',
            points: { prop: 'tailBody.vertices',
              modifier: (vertices) => {
                console.log(vertices);
                var outputArray = [];
                for (const [key, point] of Object.entries(vertices)) {
                  outputArray.push([point.x, point.y])
                }
                return outputArray;
              }
          }
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
      type: 'Sensor',
      svgClass: '',
      desc: 'Centre Left Field Sensor',
      shape: 'circle',
      dataPoints: { sceneProp: 'robots' },
      staticAttrs: {
          r: 2,
          id: { prop: 'id' }
      },
      dynamicAttrs: {
          stroke: 'none',
          fill: 'purple',
          cx: { prop: 'sensors.fields.sensingPoints.centreLeft.x' },
          cy: { prop: 'sensors.fields.sensingPoints.centreLeft.y' }
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
      desc: 'Centre Right Field Sensor',
      shape: 'circle',
      dataPoints: { sceneProp: 'robots' },
      staticAttrs: {
          r: 2,
          id: { prop: 'id' }
      },
      dynamicAttrs: {
          stroke: 'none',
          fill: 'purple',
          cx: { prop: 'sensors.fields.sensingPoints.centreRight.x' },
          cy: { prop: 'sensors.fields.sensingPoints.centreRight.y' }
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
      type: 'Sensor',
      svgClass: '',
      desc: 'Left Polygon Puck Sensor',
      shape: 'polygon',
      dataPoints: { sceneProp: 'robots' },
      staticAttrs: {
          stroke: 'none',
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