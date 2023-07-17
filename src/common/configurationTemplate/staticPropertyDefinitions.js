// DO NOT MODIFY, ALL SCENES WILL BE AFFECTED
// Import in scene configurations, clone, and override with desired values instead
const staticPropertyDefinitions = {
  envWidth: {
    name: 'envWidth',
    title: 'Env Width',
    type: 'int',
    defaultValue: 0,
    min: 300,
    max: 800,
    step: 1,
    desc: 'Controls the width of the environment.',
    path: 'env.width'
  },
  envHeight: {
    name: 'envHeight',
    title: 'Env Height',
    type: 'int',
    defaultValue: 0,
    min: 300,
    max: 800,
    step: 1,
    desc: 'Controls the width of the environment.',
    path: 'env.height'
  },
  robotCount: {
    name: 'robotCount',
    title: 'Robots',
    type: 'int',
    defaultValue: 0,
    min: 1,
    max: 50,
    step: 1,
    desc: 'Controls number of robots.',
    path: 'robots.count'
  },
  robotRadius: {
    name: 'robotRadius',
    title: 'Robot Radius',
    type: 'float',
    defaultValue: 0,
    min: 5,
    max: 20,
    step: 0.1,
    desc: 'Controls number of robots.',
    path: 'robots.radius'
  },
  velocityScale: {
    name: 'velocityScale',
    title: 'Velocity',
    type: 'float',
    defaultValue: 15,
    min: 1,
    max: 50,
    step: 0.1,
    desc: 'Controls robots velocity, only works when supported in robot controller.',
    path: 'robots.params.velocityScale'
  },
  pucksCountG1: {
    name: 'pucksCountG1',
    title: 'Pucks (G1)',
    type: 'int',
    defaultValue: 0,
    min: 0,
    max: 200,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[0].count'
  },
  pucksRadiusG1: {
    name: 'pucksRadiusG1',
    title: 'Puck Radius (G1)',
    type: 'float',
    defaultValue: 0,
    min: 3,
    max: 10,
    step: 0.1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[0].radius'
  },
  pucksGoalXG1: {
    name: 'pucksGoalXG1',
    title: 'Pucks Goal X (G1)',
    type: 'int',
    defaultValue: 0,
    min: 0,
    max: 800,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[0].goal.x'
  },
  pucksGoalYG1: {
    name: 'pucksGoalYG1',
    title: 'Pucks Goal Y (G1)',
    type: 'int',
    defaultValue: 0,
    min: 0,
    max: 500,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[0].goal.y'
  },
  pucksGoalRadiusG1: {
    name: 'pucksGoalRadiusG1',
    title: 'Pucks Goal Radius (G1)',
    type: 'int',
    defaultValue: 0,
    min: 50,
    max: 150,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[0].goalRadius'
  },
  pucksCountG2: {
    name: 'pucksCountG2',
    title: 'Pucks (G2)',
    type: 'int',
    defaultValue: 0,
    min: 0,
    max: 200,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[1].count'
  },
  pucksRadiusG2: {
    name: 'pucksRadiusG2',
    title: 'Puck Radius (G2)',
    type: 'float',
    defaultValue: 0,
    min: 3,
    max: 10,
    step: 0.1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[1].radius'
  },
  pucksGoalXG2: {
    name: 'pucksGoalXG2',
    title: 'Pucks Goal X (G2)',
    type: 'int',
    defaultValue: 0,
    min: 0,
    max: 800,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[1].goal.x'
  },
  pucksGoalYG2: {
    name: 'pucksGoalYG2',
    title: 'Pucks Goal Y (G2)',
    type: 'int',
    defaultValue: 0,
    min: 0,
    max: 500,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[1].goal.y'
  },
  pucksGoalRadiusG2: {
    name: 'pucksGoalRadiusG2',
    title: 'Pucks Goal Radius (G2)',
    type: 'int',
    defaultValue: 0,
    min: 50,
    max: 150,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    path: 'pucks.groups.[1].goalRadius'
  }
};

export default staticPropertyDefinitions;
