import './stylesheets/styles.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { exampleConfigs } from './swarmjs-core';

const { simConfig, benchmarkConfig } = exampleConfigs.simpleSorting;

ReactDOM.render(
  <App config={simConfig} benchSettings={benchmarkConfig}/>,
  document.getElementById('root')
);
