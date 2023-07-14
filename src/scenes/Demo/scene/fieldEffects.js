import * as StackBlur from 'stackblur-canvas/dist/stackblur-es.min';
import { updateFieldAtPoint } from '@common/utils/canvasUtils';

export default function fieldEffects(scene) {

  // For the pheromone field, apply a simple Gaussian-like blur filter with the 
  // passed radius to a specified box in the field with parameters: 
  // (canvasElement, xOfTopLeftBox, yOfTopLeftBox, widthOfBox, heightOfBox, radiusOfBlur)
  // Reference for the blur algorithm availabe at: https://www.npmjs.com/package/stackblur-canvas
  const pheromone = scene.fields.pheromone;
  if (pheromone?.canvasElem?.width && pheromone?.canvasElem?.height) {
    StackBlur.canvasRGBA(pheromone.canvasElem, 0, 0, pheromone.canvasElem.width, pheromone.canvasElem.height, 3);
  }

  // For each robot, mark its occupancy.  This could be useful for some analytical
  // purpose but the robots pay no attention to the occupancy field.
  const occupancy = scene.fields.occupancy;
  if (occupancy?.canvasElem?.width && occupancy?.canvasElem?.height) {
    scene.robots.forEach((robot) => {
      updateFieldAtPoint(
        occupancy.context,
        robot.sensors.position,
        [
          [[255, 255, 255, 255]]
        ]
      );
    });
  }
}
