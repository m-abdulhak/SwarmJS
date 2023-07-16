/* eslint-disable no-param-reassign */
import { Delaunay } from 'd3-delaunay';

// DO NOT MODIFY, ALL SCENES WILL BE AFFECTED
// Import in scene configurations, clone, and override with desired values instead
const dynamicPropertyDefinitions = {
  robotCount: {
    name: 'robotCount',
    title: 'Robots',
    type: 'int',
    defaultValue: (sceneConfig) => sceneConfig?.robots?.count || 0,
    min: 0,
    max: 50,
    step: 0.1,
    desc: 'Controls number of robots.',
    changeHandler: (newVal, scene) => {
      if (newVal != null) {
        if (newVal !== scene.robots.length) {
          const diff = newVal - scene.robots.length;

          if (diff > 0) {
            scene.robots.push(...scene.initializeRobotsRange(
              diff,
              scene.robotRadius,
              scene.robotsConfig.controllers,
              scene.robotsConfig.sensors,
              scene.robotsConfig.actuators,
              scene.width,
              scene.height,
              scene.robotsConfig.misc,
              scene.robots.length
            ));
          } else {
            scene.robots = scene.robots.slice(0, newVal);
          }

          scene.voronoi = !scene.useVoronoi ? null : Delaunay
            .from(scene.getCurRobotsPos(), (d) => d.x, (d) => d.y)
            .voronoi([0, 0, scene.width, scene.height]);
        }
      }
    }
  },
  velocityScale: {
    name: 'velocityScale',
    title: 'Velocity',
    type: 'float',
    defaultValue: (sceneConfig) => sceneConfig?.robots?.params?.velocityScale || 15,
    min: 1,
    max: 50,
    step: 0.1,
    desc: 'Controls robots velocity, only works when supported in robot controller.',
    changeHandler: (newVal, scene) => {
      if (newVal && typeof newVal === 'number' && newVal > 0) {
        scene.robots.forEach((r) => { r.velocityScale = newVal; });
      }
    }
  },
  pucksCountG1: {
    name: 'pucksCountG1',
    title: 'Puck (G1)',
    type: 'int',
    defaultValue: (sceneConfig) => sceneConfig?.pucks?.groups?.[0]?.count || 0,
    min: 0,
    max: 200,
    step: 1,
    desc: 'Controls number of pucks in group 1, if supported by scene.',
    changeHandler: (newVal, scene) => {
      if (newVal != null && typeof newVal === 'number' && newVal >= 0) {
        const curCount = (scene.pucks || []).filter((p) => p.group === 0).length;
        if (newVal !== curCount) {
          const diff = newVal - curCount;

          if (diff > 0) {
            scene.addPucksToGroup(0, diff);
          } else {
            scene.removePucksFromGroup(0, -1 * diff);
          }
        }
      }
    }
  },
  pucksCountG2: {
    name: 'pucksCountG2',
    title: 'Puck (G2)',
    type: 'int',
    defaultValue: (sceneConfig) => sceneConfig?.pucks?.groups?.[1]?.count || 0,
    min: 0,
    max: 200,
    step: 1,
    desc: 'Controls number of pucks in group 2, if supported by scene.',
    changeHandler: (newVal, scene) => {
      if (newVal != null && typeof newVal === 'number' && newVal >= 0) {
        const curCount = (scene.pucks || []).filter((p) => p.group === 1).length;
        if (newVal !== curCount) {
          const diff = newVal - curCount;

          if (diff > 0) {
            scene.addPucksToGroup(1, diff);
          } else {
            scene.removePucksFromGroup(1, -1 * diff);
          }
        }
      }
    }
  }
};

export default dynamicPropertyDefinitions;
