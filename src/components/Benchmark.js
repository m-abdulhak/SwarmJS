import React from 'react';

const Benchmark = () => (
  <div id="graph-container" style={{ position: 'absolute', left: '10px' }}>
    <div style={{
      margin: 'auto', width: '1400px', padding: '10px', border: 'solid 1px black'
    }}>
      <div style={{ width: 'fit-content', margin: 'auto' }}>
        <p style={{ fontWeight: 900 }}>Total Puck-Goal Distances</p>
      </div>
      <div id="total-distance-graph" className="aGraph" style={{ display: 'block' }} width="1400" height="600"></div>
      <div style={{ width: 'fit-content', margin: 'auto' }}>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Proposed Sorting Algorithm:</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'green', margin: '0px', marginRight: '5px', position: 'relative', top: '-12px', fontSize: 'xx-large', fontWeight: 900
        }}>____</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Means</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'darkseagreen', marginRight: '5px', position: 'relative', top: '-9px'
        }}>_______</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Individual</p>
      </div>
      <div style={{ width: 'fit-content', margin: 'auto' }}>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Baseline Algorithm:</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'midnightblue', margin: '0px', marginRight: '5px', position: 'relative', top: '-12px', fontSize: 'xx-large', fontWeight: 900
        }}>____</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Means</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'cornflowerblue', marginRight: '5px', position: 'relative', top: '-9px'
        }}>______</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Individual</p>
      </div>
    </div>
    <br/>
    <div style={{
      margin: 'auto', width: '1400px', padding: '10px', border: 'solid 1px black'
    }}>
      <div style={{ width: 'fit-content', margin: 'auto' }}>
        <p style={{ fontWeight: 900 }}>Pucks Outside Goal Areas</p>
      </div>
      <div id="pucks-count-graph" className="aGraph" style={{ display: 'block' }} width="1400" height="600"></div>
      <div style={{ width: 'fit-content', margin: 'auto' }}>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Proposed Sorting Algorithm:</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'green', margin: '0px', marginRight: '5px', position: 'relative', top: '-12px', fontSize: 'xx-large', fontWeight: 900
        }}>____</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Means</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'darkseagreen', marginRight: '5px', position: 'relative', top: '-9px'
        }}>_______</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Individual</p>
      </div>
      <div style={{ width: 'fit-content', margin: 'auto' }}>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Baseline Algorithm:</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'midnightblue', margin: '0px', marginRight: '5px', position: 'relative', top: '-12px', fontSize: 'xx-large', fontWeight: 900
        }}>____</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Means</p>
        <p style={{
          display: 'inline-block', width: 'fit-content', color: 'cornflowerblue', marginRight: '5px', position: 'relative', top: '-9px'
        }}>______</p>
        <p style={{ display: 'inline-block', marginRight: '20px' }}>Individual</p>
      </div>
    </div>
  </div>
);

export default Benchmark;
