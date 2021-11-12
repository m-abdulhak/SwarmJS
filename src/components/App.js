import React from 'react';
import Options from './Options';
import Benchmark from './Benchmark';

import {
  getSimulation,
  getAvailableAlgorithms,
  resetSimulation,
  togglePauseSimulation,
  setSpeed,
  changeAlgorithm
} from '../swarmjs-core/main';
import Renderer from '../swarmjs-core/renderer';

const App = () => {
  // const [time, setTime] = React.useState(0);

  const config = {
    env: {
      width: 800,
      height: 500
    },
    robots: {
      count: 20,
      radius: 7
    },
    pucks: {
      groups: [
        {
          id: 0,
          count: 20,
          radius: 10,
          goal: { x: 150, y: 250 },
          color: 'red'
        },
        {
          id: 1,
          count: 20,
          radius: 10,
          goal: { x: 650, y: 375 },
          color: 'blue'
        }
      ]
    },
    objects: [
      {
        type: 'rectangle',
        center: { x: 400, y: 100 },
        width: 50,
        height: 225
      },
      {
        type: 'rectangle',
        center: { x: 550, y: 225 },
        width: 350,
        height: 50
      },
      {
        type: 'rectangle',
        center: { x: 750, y: 100 },
        width: 350,
        height: 50
      },
      {
        type: 'circle',
        center: { x: 100, y: 150 },
        radius: 50,
        skipOrbit: true
      },
      {
        type: 'rectangle',
        center: { x: 350, y: 425 },
        width: 50,
        height: 150
      },
      {
        type: 'rectangle',
        center: { x: 250, y: 375 },
        width: 250,
        height: 50
      }
    ]
  };
  const svgRef = React.useRef(null);
  const renderer = new Renderer();

  const onUpdate = (newTime, scene) => {
    // setTime(newTime);
    renderer.update(svgRef.current, scene);
  };

  getSimulation(config, onUpdate);

  const reset = () => {
    renderer.initialized = false;
    resetSimulation(config);
  };

  return (
  <div>
    <svg ref={svgRef} width={config.env.width} height={config.env.height} style={{ border: '#bfbebe solid 3px' }}></svg>
    <br/>
    <Options
      togglePause={togglePauseSimulation}
      setSpeed={setSpeed}
      reset={reset}
      renderingElements = {renderer.renderingElements}
      setElementEnabled={renderer.setElementEnabled}
      availableAlgorithms={getAvailableAlgorithms()}
      changeAlgorithm={changeAlgorithm}
      time={0}
    />
    <Benchmark />
  </div>
  );
};

export default App;
