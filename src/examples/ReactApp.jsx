// Example React app using pxlNav
import React from 'react';
import PxlNavContainer from '../pxlNavContainer';

export default function App() {
  const handlePxlNavBooted = ()=>{
    console.log('pxlNav has finished loading!');
  };

  const handlePxlNavError = (error)=>{
    console.error('pxlNav failed to load:', error);
  };

  const customOptions = {
    verbose: 3, // INFO level
    fps: {
      pc: 60,
      mobile: 30
    },
    userSettings: {
      height: {
        standing: 1.75,
        stepSize: 5
      }
    }
  };

  return (
    <div className="App">
      <header style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000, padding: '10px' }}>
        <h1>My pxlNav React App</h1>
      </header>
      
      <PxlNavContainer
        projectTitle="My React pxlNav Project"
        options={customOptions}
        startingRoom="DefaultRoom"
        roomBootList={["DefaultRoom"]}
        onBooted={handlePxlNavBooted}
        onError={handlePxlNavError}
      />
    </div>
  );
}
