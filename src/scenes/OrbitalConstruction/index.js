import {
    CoreSensors,
    CorePositionsGenerators,
    CorePerformanceTrakers
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import RobotRenderables from './robot/renderables';

import controller from './robot/controllers/controller';

import mapUrl from './map.png';

const renderables = [
    { module: 'Scene', elements: SceneRenderables },
    { module: 'Puck', elements: PuckRenderables },
    { module: 'Robot', elements: [...RobotRenderables] }
];

const usedSensors = {
    ...CoreSensors,
    walls: {
        ...CoreSensors.walls,
        params: {
            detectionRadius: 10
        }
    },
    fields: {
        ...CoreSensors.fields,
        params: {
            // See the comments in FieldSensorExample for how to define points.
            points: [
                {
                    type: 'Polar',
                    name: 'leftField',
                    coords: {
                        distance: 10,
                        angle: -Math.PI / 4
                    }
                },
                {
                    type: 'Polar',
                    name: 'frontField',
                    coords: {
                        distance: 10,
                        angle: 0
                    }
                },
                {
                    type: 'Polar',
                    name: 'rightField',
                    coords: {
                        distance: 10,
                        angle: Math.PI / 4
                    }
                }
            ]
        }
    },
    circlePucks: {
        ...CoreSensors.circlePucks,
        params: {
            detectionRadius: 40,

            // See the comments in FieldSensorExample for how to define points.
            points: [
                {
                    type: 'Polar',
                    name: 'leftPucks',
                    coords: {
                        distance: 50,
                        angle: -Math.PI / 4
                    }
                },
                {
                    type: 'Polar',
                    name: 'rightPucks',
                    coords: {
                        distance: 50,
                        angle: Math.PI / 4
                    }
                }
            ]
        }
    }
};

const simConfig = {
    env: {
        width: 600,
        height: 400,
        speed: 15,
        background: mapUrl,
        fields: {
            heatMap: {
                url: mapUrl
            }
        }
    },
    robots: {
        count: 20,
        radius: 5,
        controllers: {
            velocity: {
                controller: controller,
                params: { angularVelocityScale: 0.001 }
            }
        },
        sensors: [...Object.values(usedSensors)],
        actuators: [],
        // The neighbors sensor doesn't work unless the Voronoi diagram is used.
        useVoronoiDiagram: true,
        misc: {
            // EXAMPLE: passing misc objects from config to robots (has to be under 'misc' key)
            sceneSpecificMap: 'test'
        }
    },
    pucks: {
        groups: [
            {
                id: 0,
                count: 100,
                radius: 8,
                color: 'red'
            }
        ],
        useGlobalPuckMaps: false
    },
    objects: [],
    positionsGenerator: CorePositionsGenerators.randomCollisionFree,
    renderables
};

const benchmarkConfig = {
    simConfigs: [
        {
            name: '5 Robots',
            simConfig: {
                env: {
                    speed: 50
                },
                robots: {
                    count: 5
                }
            }
        },
        {
            name: '20 Robots',
            simConfig: {
                env: {
                    speed: 50
                }
            }
        }
    ],
    trackers: [
        CorePerformanceTrakers.RobotToGoalDistanceTracker,
        CorePerformanceTrakers.MinRobotRobotDistanceTracker
    ],
    maxTimeStep: 20000,
    timeStep: 1000
};

export default {
    title: 'Orbital Construction',
    name: 'orbitalConstruction',
    simConfig,
    benchmarkConfig
};
