import Sensor from '../sensor';
import { sensorSamplingTypes, availableSensors } from '../sensorManager';
import generateStaticObject from '../../../staticObjects/staticObjectFactory';

const name = 'nearbyObstacles';

const getNearbyEnvObstacles = (pos, objects, detectionRadius) => {
  const staticObstacles = [...objects.filter(
    (obj) => obj.getDistanceToBorder(pos) < detectionRadius
  )];

  return staticObstacles;
};

class NearbyObstaclesSensor extends Sensor {
  constructor(robot, scene, { detectionRadius } = {}) {
    super(robot, scene, name, sensorSamplingTypes.onUpdate);
    this.dependencies = [
      availableSensors.position,
      availableSensors.nearbyPucks
    ];
    this.value = [];

    this.DETECTION_RADIUS = detectionRadius == null ? robot.radius * 10 : detectionRadius;
  }

  sample() {
    // Nearby obstacles from the environment (static objects)
    const staticObstacles = getNearbyEnvObstacles(
      this.robot.sensors.position,
      this.scene.staticObjects,
      this.DETECTION_RADIUS
    );

    // Nearby obstacles from pucks that reached their goals
    const nearbyPucksInsideGoals = this.robot.sensors.nearbyPucks.filter((puck) => puck.deepInGoal());
    const pucksObstacles = nearbyPucksInsideGoals.map((puck) => {
      const staticObstacleDefinition = puck.generateStaticObjectDefinition();
      return generateStaticObject(staticObstacleDefinition, this.scene, false);
    });

    this.value = [...staticObstacles, ...pucksObstacles];
  }
}

export default {
  name,
  Sensor: NearbyObstaclesSensor
};
