import {
    CoreSensors,
    ExtraSensors,
    CorePositionsGenerators,
    CorePerformanceTrakers
} from '@common';

import SceneRenderables from '@common/scene/renderables';
import PuckRenderables from '@common/puck/renderables';
import RobotRenderables from './robot/renderables';

import controller from './robot/controllers/controller';

import mapUrl from '../../../python_scripts/scalar_field.png';

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
                        distance: 6,
                        angle: -Math.PI / 4
                    }
                },
                {
                    type: 'Polar',
                    name: 'frontField',
                    coords: {
                        distance: 6,
                        angle: 0
                    }
                },
                {
                    type: 'Polar',
                    name: 'rightField',
                    coords: {
                        distance: 6,
                        angle: Math.PI / 4
                    }
                }
            ]
        }
    },
    polygonPucks: {
        ...ExtraSensors.polygonPucks,
        params: {
            // See the comments in FieldSensorExample for how to define points.
            vertices:
            {
                left: [
                    { type: 'Polar', name: '0', coords: { distance: 100, angle: -1.0 * Math.PI / 2 } },
                    { type: 'Polar', name: '1', coords: { distance: 100, angle: -0.75 * Math.PI / 2 } },
                    { type: 'Polar', name: '2', coords: { distance: 100, angle: -0.5 * Math.PI / 2 } },
                    { type: 'Polar', name: '3', coords: { distance: 100, angle: -0.25 * Math.PI / 2 } },
                    { type: 'Polar', name: '4', coords: { distance: 100, angle: 0.0 * Math.PI / 2 } },
                    { type: 'Cartesian', name: 'bottomRight', coords: { x: 0, y: 5 } }
                ],
                right: [
                    { type: 'Polar', name: '0', coords: { distance: 50, angle: 1.0 * Math.PI / 2 } },
                    { type: 'Polar', name: '1', coords: { distance: 50, angle: 0.75 * Math.PI / 2 } },
                    { type: 'Polar', name: '2', coords: { distance: 50, angle: 0.5 * Math.PI / 2 } },
                    { type: 'Polar', name: '3', coords: { distance: 50, angle: 0.25 * Math.PI / 2 } },
                    { type: 'Cartesian', name: 'bottomRight', coords: { x: 0, y: -5 } }
                ]
            }
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
        count: 30,
        radius: 4,
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
